#pragma strict

var testMode : boolean = true;	// test mode makes a smaller wheel
var testRowCount : int = 8;

var platform: Transform;
var player : Transform;
var center : GameObject;
var stationary : GameObject;
var pinwheel : GameObject;
var startPlatform : GameObject;
var centerCylinder : GameObject;
var trampoline : GameObject;

private var centers : Transform[] = new Transform[7];
static var reverseCenters : Transform[] = new Transform[7];
static var speed : float = 3.5;
private var centerRadius : int = 350;

static var rows : int = 32;							// Number of rows of platforms (30)
static var pipeOnlyRows : int = 12;					// How many rows up top will only have piping platforms (10)
private var pipeOnlyInterval : int = 2;				// Each time a donut is generated, pipeOnlyInterval rows are added
static var activeInterval : int = 0;				// Intervals below this value are active
static var maxInterval : int[] = new int[6];		// Keeps track of the highest interval for each column

static var columns : int = 6;						// Number of platforms in first row
static var radius : int = 20;						// Distance between rows
static var pipeCount : int[,];						// [centers, rows] Number of pipes that have been generated in each column
static var columnColors : Color[];					// Color of pipes in columns after donuts have been collected
static var fullPipes : int = 0;						// Number of columns that have generated pipes from bottom to top
static var platformCount : int;

static var instance : Wheel;

var prevNearest : Platform = null;
static var direction : int = 1;						// clockwise = 1, counter-clockwise = -1;
private var directionVector : Vector3 = Vector3(1, 0, 0);
static var nearestCenter : Transform;
private var nearestCenterIndex : int = 0;
static var playerRow : int = 0;

private var axis : Vector3 = Vector3.right;
private var xDistance : float = -500.0;

private var platforms : Transform[,]; //= new Transform[7, 1026];
private var pinwheels : Transform[] = new Transform[7];
private var count : int = 0;
private var plats : GameObject[];	// all of the platforms in the game
private var platScripts : Platform[];
private var dirtyPlatforms : GameObject[];
private var savePlatIndex : int = 0;

private var timeScale : float = 1.0;

private var tutorialSpeed : boolean = true;

function Awake () {
	
	if (testMode) {
		rows = testRowCount;
		pipeOnlyRows = 12;
	}
	
	columnColors = new Color[7];
	for (var j = 0; j < columnColors.Length; j ++) {
		columnColors[j] = CustomColor.yellow;
	}
	
	for (var i = 0; i < rows + 1; i ++) {
		platformCount += (i + 1) * columns;
	}
	platforms = new Transform[1, platformCount];
	
	CreateCenters();
	CreatePinwheels();
	
	axis = Vector3.right;

	CreateCenterCylinders(centers[0]);
	CreateTrampolines();
	CreateWheel(radius, centers[0], speed, 0, axis);
	
	for (i = 0; i < maxInterval.Length; i ++) {
		maxInterval[i] = 5;
	}
	
	instance = this;
}

function Start () {

	Messenger.instance.Listen("reverse_wheel", this);
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("set_difficulty", this);
	Messenger.instance.Listen("restart_game", this);
	Messenger.instance.Listen("wheel_spin", this);
	Messenger.instance.Listen("wheel_stop", this);
	Messenger.instance.Listen("create_donut", this);
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
	
	if (!GameObject.Find("Tutorial")) {
		tutorialSpeed = false;
		SetDirectionVector(speed);
	} else {
		SetDirectionVector(0.001);
	}
	
}

function CreateCenters () {
	
	axis = Vector3.right;
	var c2 : GameObject = GameObject.Instantiate(center, Vector3.zero, Quaternion.Euler(axis));
	centers[0] = c2.transform;
	
	var rc : GameObject = GameObject.Instantiate(center, Vector3.zero, Quaternion.Euler(axis));
	reverseCenters[0] = rc.transform;
}

function CreateCenterCylinders (c : Transform) {
	for (var i = 0; i < 3; i ++) {
		var cc : GameObject = GameObject.Instantiate(centerCylinder, c.position, Quaternion.identity);
		cc.transform.parent = c;
		cc.transform.localEulerAngles.x = (i * 60.0) - 1.0;
	}
}

function CreateStructures () {
	
	var i : int = 0;
	var pos : Vector3 = centers[i].position;
	var p : GameObject = GameObject.Instantiate(startPlatform, Vector3(pos.x, pos.y, pos.z), Quaternion.identity);
	p.GetComponent(StartOutline).center = centers[i];
	

}

function CreatePinwheels () {
	
	var i : int = 0;
	var p : GameObject = GameObject.Instantiate(pinwheel, Vector3(centers[i].position.x - (30 * axis.x), centers[i].position.y, centers[i].position.z), Quaternion.identity);
	p.transform.localScale.y = 0.001;
	p.GetComponent(Pinwheel).center = centers[i];
	pinwheels[i] = p.transform;
	pinwheels[i].transform.parent = reverseCenters[0];

}

function CreateRow (amt : float, r : float, row : int, cen : Transform, c : int, speed : float, wheel : int, ax : Vector3) {

	var deg = 360.0 / amt;	
	var index : int = -1;
	
	for (var i = 0; i < amt; i ++) {		

		index ++;
		
		// only create piping platforms above a certain point
		if (row > rows - pipeOnlyRows) { 
			if ((index + 1) % (row + 1) != 1) {
				continue;
			}
		}
		
		var rad = (i * deg) * Mathf.Deg2Rad;
		var x : float = Mathf.Sin(rad) * r * Mathf.Abs(ax.z);
		var y : float = Mathf.Cos(rad) * r;
		var z : float = Mathf.Sin(rad) * r * Mathf.Abs(ax.x);
		var p : Transform = Instantiate(platform, Vector3 (cen.position.x + x, cen.position.y + y, cen.position.z + z), Quaternion.identity);
		platforms[c, count] = p;
		count ++;
		p.transform.rotation = Quaternion.Euler(i * deg * ax.x, 0, i * -deg * ax.z);
		p.transform.parent = centers[c];
		
		var platform = p.GetComponent(Platform);
		platform.row = row;
		platform.index = index;
		platform.center = cen;
		platform.speed = speed;
		platform.wheel = wheel;
		
		// For rows with only pipes, set the interval in the platforms
		// (when donuts are collected, more platforms are activated, based on their intervals)
		if (row > rows - pipeOnlyRows) {
			platform.interval = Mathf.Abs(
								Mathf.FloorToInt(
								((rows - row) + 0.0) / (pipeOnlyRows / 6.0)) 
								- (((pipeOnlyRows + 0.0) / (pipeOnlyRows / 6.0)) - 1));
		}
		
		//platform.Create ();
	}
}

function CreateWheel (r : int, cen : Transform, speed : float, wheel : int, ax : Vector3) {
	
	count = 0;
	for (var i = 0; i < rows + 1; i ++) {
		CreateRow((i + 1) * columns, (i + 1) * r, i, cen, /*FindCenterInArray(cen)*/0, speed, wheel, ax);
	}
	
	InitPlatformArrays ();
	
}

function InitPlatformArrays () {
	plats = GameObject.FindGameObjectsWithTag("Platform");
	platScripts = new Platform[plats.Length];
	for (var i = 0; i < plats.Length; i ++) {
		if (plats[i].GetComponent (Platform))
			platScripts[i] = plats[i].GetComponent (Platform);
	}
	dirtyPlatforms = new GameObject[plats.Length];
	for (i = 0; i < dirtyPlatforms.Length; i ++) {
		dirtyPlatforms[i] = null;
	}
	BeginInvokes ();
}

function BeginInvokes () {
	InvokeRepeating("FindNearestPlatform", 0.25, 0.1);
	InvokeRepeating("SetPlayerRow", 0.0, 0.2);
}

function CreateTrampolines () {
	for (var i = 1; i < rows + 1; i += 2) {
		var t : GameObject = GameObject.Instantiate(trampoline, Vector3(15, -(i * radius), 0), Quaternion.identity);
		t.GetComponent(TrampolineOutline).row = i;
	}
}

function FindCenterInArray (t : Transform) {
	for (var i = 0; i < 7; i ++) {
		if (centers[i].transform == t) {
			return i;
		}
	}
	return -1;
}

function FindNearestPlatform () {
	
	var nearestDisSqr : float = Mathf.Infinity;
	var nearestPlat : Platform = null;
	
	for (var obj : Platform in platScripts) {
		var objPos = obj.myTransform.position;
		var disSqr = (objPos - player.position).sqrMagnitude;
		if (disSqr < nearestDisSqr) {
			nearestPlat = obj;
			nearestDisSqr = disSqr;
		}
	}
	
	// Reset the previous nearest platform
	if (prevNearest != null && prevNearest != nearestPlat)// && prevNearest.gameObject.activeSelf)
		prevNearest.UnmakeNearest();
		
	// Update the new nearest platform
	if (prevNearest != nearestPlat) {// && nearestPlat.gameObject.activeSelf) {
		prevNearest = nearestPlat;
		nearestPlat.MakeNearest();
	}
	
}

function SetPlayerRow () {
	
	var playerPosition : Vector2 = Vector2(player.position.z, player.position.y);
	var playerDistance : float = Vector2.Distance(playerPosition, Vector2(0, 0));
	var newRow : int;
	if (player.position.y > 0.0) {
		newRow = Mathf.Floor(playerDistance / 20.0) - 1;
	} else {
		newRow = Mathf.Ceil(playerDistance / 20.0) - 1;
	}
	
	if (newRow != playerRow) {
		playerRow = newRow;
		new MessageNewRow();
	}
	
}

function AddToPipeCount (wheel : int, column : int) {
	pipeCount[wheel, column] ++;
	
	yield WaitForFixedUpdate();
	if (pipeCount[wheel, column] == rows - 1) {
		fullPipes ++;
	}
}

function FindCenterTransform (index : int) {
	return centers[index];
}

function GetNextCenter () {
	return centers[nearestCenterIndex + 1];
}

// The wheel moves all the platforms
function FixedUpdate () {
	centers[nearestCenterIndex].Rotate(directionVector * Time.deltaTime * timeScale);
	reverseCenters[nearestCenterIndex].Rotate(-directionVector * Time.deltaTime * timeScale);
}

function SetColumnColor (column : int, color : Color) {

	if (color == CustomColor.yellow) {
		// a hack that allows the pipe to know if this yellow is from the collected donut
		color.a = 0.99;
	}
	columnColors[column] = color;

}

function GetColumnColor (column : int) : Color {
	if (column > -1) {
		return columnColors[column];
	} else {
		return CustomColor.yellow;
	}
}

function _LerpTime () {
	timeScale = TimeController.timeScale * TimeController.reverserTimeScale;
}

function _ReverseWheel () {
	Wheel.direction *= -1;
	directionVector *= -1;
}

function _SetDifficulty () {
	var d : int = GameController.instance.GetDifficulty();
	switch (d) {
		case 0 : speed = 1.5;
				 break;
		case 1 : speed = 3.5;
				 break;
		case 2 : speed = 5.0;
				 break;
		case 3 : speed = 7.5;
				 break;
	}
	if (!tutorialSpeed)
		SetDirectionVector(speed);
}

function _RestartGame () {
	if (direction == -1) {
		new MessageReverseWheel();
	}
	
	if (prevNearest != null)
		prevNearest.UnmakeNearest();

	for (var p : GameObject in plats) {
		var pl : Platform = p.GetComponent(Platform);
		p.SetActive(true);
		pl._RestartGame();
	}
	
	for (var j = 0; j < columnColors.Length; j ++) {
		columnColors[j] = CustomColor.yellow;
		columnColors[j].a = 1.0;
	}
	
	activeInterval = 0;
	for (var i = 0; i < maxInterval.Length; i ++) {
		maxInterval[i] = 5;
	}
	
}

function _WheelSpin () {
	tutorialSpeed = false;
	SetDirectionVector(speed);
}

function _WheelStop () {
	tutorialSpeed = true;
	SetDirectionVector (0.001);
	centers[nearestCenterIndex].rotation = Quaternion.Euler (0, 0, 0);
	reverseCenters[nearestCenterIndex].rotation = Quaternion.Euler (0, 0, 0);
}

function _CreateDonut () {
	activeInterval ++;
}

function SetDirectionVector (spd : float) {
	directionVector.Normalize();
	directionVector *= spd;
}

function AddDirtyPlatform (p : GameObject) {
	for (var i = 0; i < dirtyPlatforms.Length; i ++) {
		if (dirtyPlatforms[i] == null) {
			dirtyPlatforms[i] = p;
			return;
		}
	}
}

function ResetDirtyPlatforms () {
	for (var i = 0; i < dirtyPlatforms.Length; i ++) {
		dirtyPlatforms[i] = null;
	}
}

/*function ActivateDirtyPlatforms () {
	for (var i = 0; i < dirtyPlatforms.Length; i ++) {
		if (dirtyPlatforms[i] != null) {
			dirtyPlatforms[i].SetActive (true);
		}
	}
}*/

function ActivatePlatforms () {
	for (var p : GameObject in plats) {
		//var pl : Platform = p.GetComponent(Platform);
		p.SetActive(true);
	}
}

function SaveOnCreate () {
	//yield WaitForSeconds (0.5);
	yield WaitForFixedUpdate ();
	for (var p : Platform in platScripts) {
		//yield WaitForFixedUpdate ();
		//yield WaitForFixedUpdate ();
		p.SaveOnCreate ();
	}
}

function SetWhiteOnly (b : boolean) {
	for (var p : Platform in platScripts) {
		p.SetWhiteOnly (b);
	}
}

function SetShrink (b : boolean) {
	for (var p : Platform in platScripts) {
		p.SetShrink (b);
	}
}

function _SaveGame () {
	
	var cColors : String[] = new String[7];
	for (var i = 0; i < columnColors.Length; i ++) {
		cColors[i] = ColorToString (columnColors[i]);
	}
	SaveGameManager.SaveStringArray ("wheel_columnColors", cColors);
	SaveGameManager.SaveInt			("wheel_activeInterval", activeInterval);
	SaveGameManager.SaveIntArray	("wheel_maxInterval", maxInterval);
	SaveGameManager.SaveFloat 		("wheel_speed", speed);
	
	for (var p : GameObject in dirtyPlatforms) {
		if (p != null)
			p.GetComponent (Platform).SaveDirty ();
	}
	ResetDirtyPlatforms ();
}

function _LoadGame () {
	
	var cColors : String[] = SaveGameManager.LoadStringArray ("wheel_columnColors");
	for (var i = 0; i < cColors.Length; i ++) {
		columnColors[i] = StringToColor (cColors[i]);
	}
	activeInterval = 	SaveGameManager.LoadInt ("wheel_activeInterval");
	maxInterval = 		SaveGameManager.LoadIntArray ("wheel_maxInterval");
	speed = 			SaveGameManager.LoadFloat ("wheel_speed");
	
	SetDirectionVector (speed);
}

function ColorToString (c : Color) : String {
	switch (c) {
		case CustomColor.yellow : return "Yellow";
		case CustomColor.violet : return "Violet";
		case CustomColor.blue : return "Blue";
		case CustomColor.green : return "Green";
		case CustomColor.black : return "Black";
		case CustomColor.orange : return "Orange";
		case CustomColor.white : return "White";
	}
	return "";
}

function StringToColor (s : String) : Color {
	switch (s) {
		case "Yellow": return CustomColor.yellow;
		case "Violet": return CustomColor.violet;
		case "Blue": return CustomColor.blue;
		case "Green": return CustomColor.green;
		case "Black": return CustomColor.black;
		case "Orange": return CustomColor.orange;
		case "White": return CustomColor.white;
	}
	return CustomColor.white;
}


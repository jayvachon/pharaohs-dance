#pragma strict

var target : Transform;				// What the camera will look at
var distance : float = 10.0;		// How far the camera will be "behind" the target
var height : float = 5.0;			// How far the camera will be above the target

var positionDamping : float = 1.0;	// How quickly the camera moves to position
var rotationDamping : float = 10.0;	// How quickly the camera rotates to look at the target

private var myTransform : Transform;
private var startPosition : Vector3;
private var startRotation : Vector3;
private var centerRotation : Vector3;

private var startFOV : float;
private var minFOV : float = 12.0;
private var readyZoom : boolean = false;
static var fixedUpdate : boolean = true;

private var platformScript : Platform[];// = new Platform[1026];		// each platform
private var objects : GameObject[];// = new GameObject[1600];			// all objects that are view dependent
private var activeObjects : GameObject[];// = new GameObject[1600];	// objects currently visible
private var playerRow : int = 0;									// Row that the player is currently on
private var rowRange : int = 3;										// Rows above and below the player that we'll check for activating

static var instance : MainCamera;

private var degrees : float;

private var anim : String;

private var destFOV : float = 12.0;
private var playerOnBlank : boolean = false;
private var playerFell : boolean = false;

private var border : Vector2 = Vector2(1.3, 0.3);

private var myCamera : Camera;

function Awake () {
	myTransform = transform;
	instance = this;
	
	myTransform.position = Vector3(200.0, 0.0, 0.0);
	startPosition = myTransform.position;
	
	myTransform.localEulerAngles = Vector3(0.0, 270.0, 0.0);
	startRotation = myTransform.localEulerAngles;
	
	myCamera = GetComponent(Camera);
	startFOV = myCamera.fieldOfView;
	myCamera.fieldOfView = 50.0;
	
	anim = "CameraShrinkFOV";
	
	rowRange = 8;
	
}

function Start () {
	Messenger.instance.Listen("stop_deactivating", this);
	Messenger.instance.Listen("resume_deactivating", this);
	Messenger.instance.Listen("nearest_center", this);
	Messenger.instance.Listen("close_startscreen", this);
	Messenger.instance.Listen("open_startscreen", this);
	Messenger.instance.Listen("new_row", this);
	Messenger.instance.Listen("enter_refill", this);
	Messenger.instance.Listen("exit_refill", this);
	Messenger.instance.Listen("player_fall", this);
	Messenger.instance.Listen("player_rise", this);
	BuildObjectArray();
	
	platformScript = new Platform[Wheel.platformCount];
	objects = new GameObject[Wheel.platformCount + (Wheel.platformCount / 2)]; 
	activeObjects = new GameObject[Wheel.platformCount + (Wheel.platformCount / 2)];
}

function WaitForLoad () {
	yield WaitForSeconds(0.01);
	readyZoom = true;
}

// When the player is piping, we need to use late update instead of fixed update
function LateUpdate () {
	if (!fixedUpdate) {
		MoveCamera();
	}
}

function FixedUpdate () {
	if (fixedUpdate) {
		MoveCamera();
	}
}

function MoveCamera () {
	if (readyZoom) {
		var desPosition : Vector3 = Vector3(target.position.x + distance, target.position.y + height, target.position.z);	
		myTransform.position = Vector3.Slerp(myTransform.position, desPosition, Time.deltaTime * positionDamping);
		
		var rotation = Quaternion.LookRotation(target.position - myTransform.position);
		myTransform.rotation = Quaternion.Slerp(myTransform.rotation, rotation, Time.deltaTime * rotationDamping);
	}
}

/*

1. Builds an array of objects that will turn on/off based on view
2. Activates objects in view, and adds them to an array - calls OnViewEnter function in these objects
3. Checks array for objects that have since moved out of view, and if so removes them from the array - calls OnViewExit function in these objects

*/

function BuildObjectArray () {
	yield WaitForEndOfFrame();
	objects = GameObject.FindGameObjectsWithTag("Platform") as GameObject[];
	for (var i = 0; i < objects.Length; i ++) {
		if (objects[i] != null) {
			platformScript[i] = objects[i].GetComponent(Platform);
		}
	}
	
	AddToArray("Reverser");
	AddToArray("AirBonus");
	InitiateObjectsOutOfView("Reverser");
	InitiateObjectsOutOfView("AirBonus");
		
	InvokeRepeating("ActivateObjectsInsideViewPort", 0.0, 0.25);
	InvokeRepeating("DeactivateObjectsOutsideViewPort", 0.0, 0.5);
}

function InitiateObjectsOutOfView (t : String) {
	for (var i = 0; i < objects.Length; i ++) {
		if (objects[i].tag == t) {
			ViewExit(objects[i], i);
		}
	}
}

function AddToArray (t : String) {
	objects = CombineArrays(objects, GameObject.FindGameObjectsWithTag(t) as GameObject[]);
}

function CombineArrays (array1 : GameObject[], array2 : GameObject[]) {
	var tmpArray : GameObject[] = new GameObject[array1.length + array2.length];
    var i = 0;
    for (var go : GameObject  in array1) {
        tmpArray[i ++] = go;
    }
    for (var go2 : GameObject in array2) {
        tmpArray[i ++] = go2;
    }
    return tmpArray;
}

function ActivateObjectsInsideViewPort () {
	for (var i = 0; i < objects.Length; i ++) {
		if (ObjectInView(objects[i])) {
			activeObjects[i] = objects[i];
			ViewEnter(objects[i], i);
		} 
	}
}

function DeactivateObjectsOutsideViewPort () {
	for (var i = 0; i < activeObjects.Length; i ++) {	
		if (activeObjects[i] == null)
			continue;	
		if (!ObjectInView(activeObjects[i])) {
			ViewExit(activeObjects[i], i);
			activeObjects[i] = null;
		}
	}
}

function ViewEnter (obj : GameObject, pos : int) {	
	switch (obj.tag) {
		case "Platform" : platformScript[pos].OnViewEnter();
						  obj.SetActive(true);
							  break;
		case "Reverser" : obj.GetComponent(Reverser).OnViewEnter(); break;
		case "CoinTrail": obj.GetComponent(CoinTrail).OnViewEnter(); break;
		case "AirBonus" : obj.GetComponent(AirBonus).OnViewEnter(); break;
	}
}

function ViewExit (obj : GameObject, pos : int) {	
	switch (obj.tag) {
		case "Platform" : platformScript[pos].OnViewExit();
						  obj.SetActive(false);
						  break;
		case "Reverser" : obj.GetComponent(Reverser).OnViewExit(); break;
		case "CoinTrail": obj.GetComponent(CoinTrail).OnViewExit(); break;
		case "AirBonus" : obj.GetComponent(AirBonus).OnViewExit(); break;
	}
}

function ObjectInView (obj : GameObject) {
	var yBorder : float = 1.2; // 1.33
	var xBorder : float = 0.3;	// 0.33

	var viewPos : Vector3 = camera.WorldToViewportPoint (obj.transform.position);
	return (viewPos.x > -xBorder//border.x 
			&& viewPos.x < 1.0 + xBorder//border.x 
			&& viewPos.y > -xBorder//border.x
			&& viewPos.y < 1.0 + yBorder);//border.y);
			
}

function ChangeFOV (newView : float, time : float) {
	var elapsedTime : float = 0.0;
	var cam : Camera = GetComponent(Camera);
	var oldView : float = cam.fieldOfView;
		
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent = elapsedTime / time;
		cam.fieldOfView = Mathf.Lerp(oldView, newView, percent);
		yield;
	}
}

function ResetPosition () {
	myTransform.position = startPosition;
	myTransform.localEulerAngles = startRotation;
}

function _StopDeactivating () {
	Debug.Log("Stopped deactivating");
	CancelInvoke("DeactivateObjectsOutsideViewPort");	
}

function _ResumeDeactivating () {
	Debug.Log("Resumed deactivating");
	InvokeRepeating("DeactivateObjectsOutsideViewPort", 0.0, 0.5);
}

function _CloseStartscreen () {
	if (!readyZoom) {
		animation[anim].speed = 1.0;
		animation.Play(anim);
		readyZoom = true;	
		yield WaitForSeconds(animation[anim].length);
		rowRange = 3;
	}
}

function _OpenStartscreen () {
	
	if (playerOnBlank || playerFell) return;
	
	if (StartScreen.instance.GetScreen() == 0) {
		anim = "CameraShrinkFOV";
	} else {
		anim = "CameraShrinkFOVSmall";
	}
	
	animation[anim].speed = -1.0;
	animation[anim].time = animation[anim].length;
	animation.Play(anim);
	readyZoom = false;
	
	rowRange = 8;
	
}

function _NewRow () {
	playerRow = Wheel.instance.playerRow;
}

function BeginLerpFOV (time : float, to : float) {
	destFOV = to;
	LerpFOV (time, to);
}

function LerpFOV (time : float, to : float) {
	
	var eTime : float = 0.0;
	var from : float = myCamera.fieldOfView;
	
	while (eTime < time && destFOV == to) {
		eTime += Time.deltaTime;
		myCamera.fieldOfView = Mathf.Lerp (from, to, Mathf.SmoothStep (0.0, 1.0, eTime / time));
		yield;
	}
}

function _EnterRefill () {
	playerOnBlank = true;
	yield WaitForSeconds (3.0);
	if (!playerOnBlank) return;
	BeginLerpFOV (3.0, 45.0);
}

function _ExitRefill () {
	playerOnBlank = false;
	BeginLerpFOV (3.0, minFOV);
}

function _PlayerFall () {
	playerFell = true;
	yield WaitForSeconds (0.5);
	if (!playerFell) return;
	BeginLerpFOV (1.5, 30.0);
}

function _PlayerRise () {
	playerFell = false;
	BeginLerpFOV (1.5, minFOV);
}

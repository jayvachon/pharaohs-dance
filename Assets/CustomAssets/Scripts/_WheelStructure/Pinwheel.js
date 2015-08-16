#pragma strict
#pragma downcast

var piece : GameObject;
var rotateWithWheel : boolean = false;
var center : Transform;
private var direction : Vector3;

var effect : GameObject;
private var startScale : float = 0.001;
private var fullScale : float = 1.0;
private var xScale : float = 1.0;

private var inView : boolean = false;

private var timeScale : float = 1.0;

private var pieces : GameObject[] = new GameObject[24];
private var coinPieces : GameObject[] = new GameObject[24];

private var myTransform : Transform;

// Backlight
private var backlight : Transform;
private var player : Transform;
private var backlightMin : float = 20500.0;
private var backlightMax : float = 125000.0;
private var rangeMin : float = 50.0;
private var rangeMax : float = 750.0;
private var playerMin : float = 20.0;
private var playerMax : float = 20.0;

function Awake () {
	myTransform = transform;
}

function Start () {
	
	for (var child : Transform in transform) {
		if (child.tag == "PinwheelBacklight") {
			backlight = child;
		}
	}
	
	player = GameObject.FindGameObjectWithTag("Player").transform;
	playerMax = Wheel.rows * Wheel.radius;
	
	direction = Vector3(Wheel.direction, 0, 0);
	if (!rotateWithWheel) {
		direction.x *= -1;
	}
	
	var c1 : Color = CustomColor.white;
	var trans : Shader = Shader.Find("Transparent/Diffuse");
	/*renderer.materials[0].shader = trans;
	renderer.materials[1].shader = trans;
	renderer.materials[0].color.a = 0.0;
	renderer.materials[1].color.a = 0.0;// = Color(c1.r, c1.g, c1.b, 0.0);
	renderer.materials[2].color = CustomColor.grey;*/
	c1.a = 0;
	var c2 : Color[] = [ c1, c1, CustomColor.grey ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c2);

	for (var i = 0; i < 8; i ++) {
		var fx : GameObject = GameObject.Instantiate(effect, transform.position, Quaternion.identity);
		fx.GetComponent(PinwheelEffect).periodPosition = i;
		fx.transform.parent = transform;
		//fx.transform.localEulerAngles.y = 180.0;
		fx.transform.localEulerAngles = Vector3.zero;
		fx.transform.localPosition.x = -200 + (i * 20); 
		fx.transform.localScale = Vector3(xScale, startScale, startScale);
		//fx.renderer.materials[0].color = CustomColor.colorProgression[i] + CustomColor.black;
		//fx.renderer.materials[1].color = CustomColor.colorProgression[i] + CustomColor.black;
		
		var c : Color[] = [ CustomColor.colorProgression[i] + CustomColor.black, CustomColor.colorProgression[i] + CustomColor.black ];
		fx.renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
		
		if (i == 0) {
			//fx.layer = 22;
			//fx.renderer.materials[0].color = CustomColor.grey;
			//fx.renderer.materials[1].color = CustomColor.grey;
			c = [ CustomColor.grey, CustomColor.grey ];
			fx.renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
		}
	}
	
	CreatePieces();
	CreateCoinPieces();

	Messenger.instance.Listen("reverse_wheel", this);
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("begin_pipe", this);
	Messenger.instance.Listen("collect_pill1", this);
	Messenger.instance.Listen("collect_pill2", this);
	Messenger.instance.Listen("collect_pill3", this);
	Messenger.instance.Listen("collect_pill4", this);
	Messenger.instance.Listen("collect_pill5", this);
	Messenger.instance.Listen("collect_pill6", this);
	Messenger.instance.Listen("collect_pill7", this);
	Messenger.instance.Listen("collect_crystal1", this);
	Messenger.instance.Listen("collect_crystal2", this);
	Messenger.instance.Listen("collect_crystal3", this);
	Messenger.instance.Listen("collect_crystal4", this);
	Messenger.instance.Listen("collect_crystal5", this);
	Messenger.instance.Listen("collect_crystal6", this);
	Messenger.instance.Listen("collect_crystal7", this);
	Messenger.instance.Listen("collect_coin", this);
	Messenger.instance.Listen("collect_reverser", this);
	Messenger.instance.Listen("enter_end", this);
	Messenger.instance.Listen("exit_end", this);
	
	SetFullScale();

}

function Update () {
	var distance : float = Vector3.Distance(center.position, player.position);
	backlight.localPosition.x = Mathf.Lerp(backlightMin, backlightMax, distance / playerMax);
	backlight.light.range = Mathf.Lerp(rangeMin, rangeMax, distance / playerMax);
}

function CreatePieces () {
	var deg = 360 / pieces.Length;
	var offset : float = (deg / 4) + (deg / 2);
	var x : float = -20.0;
	var r : float = 5.0;
	var pos : Vector3 = myTransform.position;
	
	for (var i = 0; i < pieces.Length; i ++) {
		var rad : float = ((i * deg) + offset) * Mathf.Deg2Rad;
		var y : float = Mathf.Cos(rad) * r;
		var z : float = Mathf.Sin(rad) * r;
		pieces[i] = GameObject.Instantiate(piece, pos, Quaternion.identity);
		pieces[i].transform.parent = myTransform;
		pieces[i].transform.localPosition = Vector3(x, y, z);
		pieces[i].transform.localEulerAngles.x = ((i * deg) + offset);
		pieces[i].transform.localScale = Vector3.one;
		pieces[i].transform.localScale.z = 0.5;
	}
}

function CreateCoinPieces () {
	var deg = 360 / coinPieces.Length;
	var offset : float = (deg / 4) + (deg / 2);
	var x : float = -25.0;
	var r : float = 5.0;
	var pos : Vector3 = myTransform.position;
	
	for (var i = 0; i < coinPieces.Length; i ++) {
		var rad : float = ((i * deg) + offset) * Mathf.Deg2Rad;
		var y : float = Mathf.Cos(rad) * r;
		var z : float = Mathf.Sin(rad) * r;
		coinPieces[i] = GameObject.Instantiate(piece, pos, Quaternion.identity);
		coinPieces[i].transform.parent = myTransform;
		coinPieces[i].transform.localPosition = Vector3(x, y, z);
		coinPieces[i].transform.localEulerAngles.x = ((i * deg) + offset);
		coinPieces[i].transform.localScale = Vector3.one;
		coinPieces[i].transform.localScale.z = 0.5;
	}
}

function ExpandAllPieces (col : Color) {
	for (var i = 0; i < pieces.Length; i ++) {
		pieces[i].GetComponent(PinwheelPieceScale).Animate(col, true);
	}
}

function ExpandRandomPiece (col : Color) {
	
	// If all of the pieces are being animated, don't bother
	for (var i = 0; i < pieces.Length; i ++) {
		if (!pieces[i].GetComponent(PinwheelPieceScale).IsPlaying()) {
			break;
		} else {
			if (i == pieces.Length - 1) {
				return;
			}
		}
	}
	
	var p : int = Mathf.RoundToInt(Random.Range(0, pieces.Length));
	while (!pieces[p].GetComponent(PinwheelPieceScale).Animate(col, false)) {
		p = Mathf.RoundToInt(Random.Range(0, pieces.Length));
		yield;
	}
	pieces[p].GetComponent(PinwheelPieceScale).Animate(col, false);
}

function ExpandRandomCoinPiece (col : Color) {
	var p : int = Mathf.RoundToInt(Random.Range(0, coinPieces.Length));
	while (!coinPieces[p].GetComponent(PinwheelPieceScale).Animate(col, false)) {
		p = Mathf.RoundToInt(Random.Range(0, coinPieces.Length));
		yield;
	}
	coinPieces[p].GetComponent(PinwheelPieceScale).Animate(col, false);
}

function OnViewEnter () {
	//renderer.enabled = true;
}

function OnViewExit () {
	//renderer.enabled = false;
}

function Resize (start : float, end : float, time : float) {
	var elapsedTime : float = 0.0;
	renderer.enabled = true;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		transform.localScale.y = Mathf.Lerp(start, end, (elapsedTime / time));
		transform.localScale.z = Mathf.Lerp(start, end, (elapsedTime / time));
		yield;
	}
	
	if (transform.localScale.y <= 0.001) {
		renderer.enabled = false;
	}
}

function SetFullScale () {
	myTransform.localScale.y = 1.75;
	myTransform.localScale.z = 1.75;
}

function ShrinkPinwheel () {
	animation.Play("PinwheelShrink");
}

function GrowPinwheel () {
	animation.Play("PinwheelGrow");
}

function _EnterEnd () {
	ShrinkPinwheel();
}

function _ExitEnd () {
	GrowPinwheel();
}

function _ReverseWheel () {
	direction.x *= -1;
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

function _CollectPill1 () {
	ExpandAllPieces(CustomColor.colorProgression[1]);
}

function _CollectPill2 () {
	ExpandAllPieces(CustomColor.colorProgression[2]);
}

function _CollectPill3 () {
	ExpandAllPieces(CustomColor.colorProgression[3]);
}

function _CollectPill4 () {
	ExpandAllPieces(CustomColor.colorProgression[4]);
}

function _CollectPill5 () {
	ExpandAllPieces(CustomColor.colorProgression[5]);
}

function _CollectPill6 () {
	ExpandAllPieces(CustomColor.colorProgression[6]);
}

function _CollectPill7 () {
	ExpandAllPieces(CustomColor.colorProgression[7]);
}

function _CollectCrystal1 () {
	ExpandAllPieces(CustomColor.colorProgression[1]);
}

function _CollectCrystal2 () {
	ExpandAllPieces(CustomColor.colorProgression[2]);
}

function _CollectCrystal3 () {
	ExpandAllPieces(CustomColor.colorProgression[3]);
}

function _CollectCrystal4 () {
	ExpandAllPieces(CustomColor.colorProgression[4]);
}

function _CollectCrystal5 () {
	ExpandAllPieces(CustomColor.colorProgression[5]);
}

function _CollectCrystal6 () {
	ExpandAllPieces(CustomColor.colorProgression[6]);
}

function _CollectCrystal7 () {
	ExpandAllPieces(CustomColor.colorProgression[7]);
}

function _CollectCoin () {
	ExpandRandomCoinPiece(CustomColor.yellow);
}

function _BeginPipe () {
	ExpandAllPieces(CustomColor.red);
}

function _CollectReverser () {
	ExpandAllPieces(CustomColor.blue);
}
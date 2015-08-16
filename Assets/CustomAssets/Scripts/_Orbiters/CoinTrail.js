#pragma strict
#pragma downcast

var center : Transform;
var coin : GameObject;
var crystal : GameObject;
var pill : GameObject;
var radius : float;

private var distance : float = 5.0;				// Distance between coins
private var myTransform : Transform;
@HideInInspector
var objectCount : int = 1;
private var height : float = 3.5;
private var timeScale : float = 1.0;
private var trailSize : int = 4;

private var state : int = 0;					// state determines what type of object is in the trail. 0 = coin, 1 = violet crystal, 2 = blue crystal, etc.

@HideInInspector
var crystalType : int = 1;

@HideInInspector
var crystalColor : Color;

@HideInInspector
var startSign : int = 1;						// negative or positive

function Start () {

	myTransform = transform;
	radius = myTransform.position.y;
	
	SetLayer();
		
	Messenger.instance.Listen("restart_game", this);
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
	
	CreateTrail(coin);
	
	crystalColor = CustomColor.colorProgression[1];
}

function SetLayer () {
	var row : int = Mathf.RoundToInt(Mathf.Abs(radius) / Wheel.radius) - 1;
	if (row <= 18) {
		gameObject.layer = (row + 10);
	} else {
		gameObject.layer = (row - 18) + 10;
	}
}

function CreateTrail (obj : GameObject) {
	yield WaitForFixedUpdate();
	
	var deg : float = (distance / (2.0 * Mathf.PI * Mathf.Abs(myTransform.position.y))) * 360.0;
	for (var i = 0; i < trailSize; i ++) {
		var position : Vector3 = myTransform.position;
		position.z += (i * 3.0);
		
		var rad : float = (i * deg) * Mathf.Deg2Rad;
		var y : float = Mathf.Cos(rad) * radius;
		var z : float = Mathf.Sin(rad) * radius;
		
		var o : GameObject = ObjectBase.instance.Instantiate(obj, Vector3(0, y, z));
		o.transform.parent = myTransform;
		o.renderer.enabled = true;
		o.layer = gameObject.layer;
	}
	objectCount = trailSize;
}

function OnViewEnter () {
	for (var child : Transform in transform) {
		child.renderer.enabled = true;
		child.collider.enabled = true;
		child.transform.GetChild(0).GetComponent(Projector).enabled = true;
	}
}

function OnViewExit () {
	for (var child : Transform in transform) {
		child.renderer.enabled = false;
		child.collider.enabled = false;
		child.transform.GetChild(0).GetComponent(Projector).enabled = false;
	}
}

function SubtractObjectCount () {

	if (objectCount > 1) {
		objectCount --;
	} else {
		myTransform.position.y = -Mathf.Abs(radius);
		myTransform.position.z = 0.0;
		radius = myTransform.position.y; //*= -1.0;
		
		if (state < 12) {
			state ++;
		} else {
			state = 0;
		}
		
		if (state == 0) {
			
			// Create a coin
			var o : GameObject = coin;
		} else {
			if (state % 2 == 0) {
				
				// Create a pill
				o = pill;
				var type : int = state / 2; 
				crystalType = type;
				crystalColor = CustomColor.colorProgression[type];	
			} else {
				
				// Create a crystal
				o = crystal;
				type = (state + 1) / 2; 
				crystalType = type;
				crystalColor = CustomColor.colorProgression[type];
			}
		}
		CreateTrail(o);
	}
}

function DestroyTrail () {
	for (var child : Transform in transform) {
		ObjectBase.instance.Destroy(child.gameObject);
	}
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

function _RestartGame () {
	state = 0;
	DestroyTrail();
	yield WaitForSeconds(1.0);
	
	state = 0;
	myTransform.position.y = Mathf.Abs(radius) * startSign;
	myTransform.position.z = 0.0;
	radius = myTransform.position.y;
	
	CreateTrail(coin);
}

function _SaveGame () {

}

function _LoadGame () {

}
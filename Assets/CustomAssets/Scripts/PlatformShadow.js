#pragma strict

var myLayerMask : LayerMask;

@HideInInspector
var caster : Transform;
//var layer : int;
private var myTransform : Transform;
private var farClip : float;
private var projector : Projector;

private var projecting : boolean = false;
private var screenUp : boolean = false;

function Awake () {
	myTransform = transform;
	myTransform.eulerAngles.x = 90;
	projector = GetComponent(Projector);
	farClip = GetComponent(Projector).farClipPlane;
	screenUp = true;
}

function Start () {
	Messenger.instance.Listen("open_startscreen", this);
	Messenger.instance.Listen("close_startscreen", this);
	Messenger.instance.Listen("open_screen", this);
	Messenger.instance.Listen("close_screen", this);
}

function OnEnable () {
	
	screenUp = StartScreen.instance.IsScreenUp();
	InvokeRepeating("ActivateInView", 0.0, 0.5);
	
}

function SetLayer (layer : int) {
	if (layer > 0)
		layer -= 1;
		
	myLayerMask = ~(1 << layer);
	projector.ignoreLayers = myLayerMask;
}

function OnDisable () {
	CancelInvoke("ActivateInView");
}

function FixedUpdate () {
	myTransform.position = caster.position;
}

function ActivateInView () {
	if (!screenUp) {
		if (ObjectInView(this.gameObject) && myTransform.position.y > 0.0) {
			projector.enabled = true;
		} else {
			projector.enabled = false;
		}
	} else {
		projector.enabled = false;
	}
}

function ObjectInView (obj : GameObject) {
	var yBorder : float = 1.25;
	var xBorder : float = 0.33;
	yBorder = 1.33;
	var viewPos : Vector3 = Camera.main.WorldToViewportPoint (Vector3(obj.transform.position.x, obj.transform.position.y - farClip, obj.transform.position.z));
	return (viewPos.x > 0.0 - xBorder && viewPos.x < 1.0 + xBorder && viewPos.y > 0.0 - (yBorder / 2) && viewPos.y < 1.0 + yBorder);
}

// We disable the projectors when the menus are open so that the game doesn't lag
function _OpenStartscreen () {	
	screenUp = true;
	CancelInvoke("ActivateInView");
	if (projector.enabled) {
		projecting = true;
		projector.enabled = false;
	} else {
		projecting = false;
	}
}

function _OpenScreen () {
	screenUp = true;
	CancelInvoke("ActivateInView");
	if (projector.enabled) {
		projecting = true;
		projector.enabled = false;
	} else {
		projecting = false;
	}
}

function _CloseStartscreen () {
	screenUp = false;
	if (projecting) {
		yield WaitForSeconds(1.5);	// Give the camera a chance to get back to "play" position
		projector.enabled = true;
		InvokeRepeating("ActivateInView", 0.0, 0.5);
	} 
}

function _CloseScreen () {
	screenUp = false;
	if (projecting) {
		projector.enabled = true;
		InvokeRepeating("ActivateInView", 0.0, 0.5);
	} 
}
#pragma strict

private var myLayerMask : LayerMask;

private var myTransform : Transform;
private var projector : Projector;

private var enableOnScreenClose : boolean = false;
private var farClip : float;

private var invoking : boolean = false;
private var invokeRate : float;
private var canEnable : boolean = false;	// if shadows are disabled, we still keep track of whether or not the shadow COULD be enabled if the setting was changed
private var projecting : boolean = false;

private var startSize : float;

function Awake () {
	myTransform = transform;
	projector = GetComponent(Projector);
	
	enableOnScreenClose = true;
	startSize = projector.orthographicSize;
	invokeRate = Random.Range(2.0, 5.0);
	
}

function Start () {
	Messenger.instance.Listen("open_startscreen", this);
	Messenger.instance.Listen("close_startscreen", this);
	Messenger.instance.Listen("open_screen", this);
	Messenger.instance.Listen("close_screen", this);	
}

function BeginInvoke () {
	if (!invoking) {
		InvokeRepeating("ActivateInView", 0.0, invokeRate);
		invoking = true;
	}
}

function EndInvoke () {
	if (invoking) {
		CancelInvoke("ActivateInView");
		invoking = false;
	}
}

function OnEnable () {

	if (GameController.instance.ShadowsEnabled()) {
		projector.enabled = true;
		projecting = true;
		canEnable = true;
		SetLayer();
		Expand();
		BeginInvoke();
	} else {
		canEnable = true;
		projector.enabled = false;
		projecting = false;
		EndInvoke();
	}
	
}

function OnDisable () {
	DisableProjector();
}

function Expand () {
	
	var time : float = 0.125;
	var eTime : float = 0.0;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		projector.orthographicSize = Mathf.Lerp(0.0, startSize, eTime / time);
		yield;
	}
}

function Shrink () {
	projector.orthographicSize = 0.0;
}

function SetLayer () {

	gameObject.layer = transform.parent.gameObject.layer;
	myLayerMask = ~(1 << gameObject.layer);
	projector.ignoreLayers = myLayerMask;
	
}

// Make sure the shadow is always pointing down
function Update () {
	if (projecting)
		myTransform.rotation = Quaternion.LookRotation(Vector3.down, myTransform.parent.forward);
}

// We disable the projectors when the menus are open so that the game doesn't lag
function _OpenStartscreen () {	
	if (projector.enabled || canEnable) {
		enableOnScreenClose = true;
		projector.enabled = false;
		EndInvoke();
	} else {
		enableOnScreenClose = false;
	}
}

function _OpenScreen () {
	if (projector.enabled) {
		enableOnScreenClose = true;
		projector.enabled = false;
		EndInvoke();
	} else {
		enableOnScreenClose = false;
	}
}

function _CloseStartscreen () {
	if (GameController.instance.ShadowsEnabled()) {
		if (canEnable) {
			yield WaitForSeconds(1.5);	// Pause while the camera returns to its "play" position
			projector.enabled = true;
			BeginInvoke();
		}
	} else {
		projector.enabled = false;
		EndInvoke();
	}
}

function _CloseScreen () {
	if (enableOnScreenClose) {
		projector.enabled = true;
		BeginInvoke();
	} 
}

function ActivateInView () {
	projecting = (ObjectInView(this.gameObject) && myTransform.position.y > 0.0);
	projector.enabled = projecting;
}

function ObjectInView (obj : GameObject) {
	var yBorder : float = 1.25;
	var xBorder : float = 0.33;
	yBorder = 1.33;
	var viewPos : Vector3 = Camera.main.WorldToViewportPoint (Vector3(obj.transform.position.x, obj.transform.position.y - farClip, obj.transform.position.z));
	return (viewPos.x > 0.0 - xBorder && viewPos.x < 1.0 + xBorder && viewPos.y > 0.0 - (yBorder / 2) && viewPos.y < 1.0 + yBorder);
}

function DisableProjector () {
	//Shrink();
	projecting = false;
	projector.enabled = false;
	EndInvoke();
	canEnable = false;
}
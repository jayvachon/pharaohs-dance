#pragma strict

private var timeScale : float = 1.0;
private var direction : Vector3;
private var speed : int = 25;
private var myTransform : Transform;

function Awake () {
	myTransform = transform;
}

function Start () {
	
	direction = Vector3(0, Wheel.direction, 0) * speed;
	
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("reverse_wheel", this);
	
}

function OnEnable () {
	StartCoroutine(RotatePipe());
}

/*function Update () {	
	transform.Rotate(direction * timeScale * Time.deltaTime);
}*/

function RotatePipe () {
	while (Application.isPlaying) {
		myTransform.Rotate(direction * timeScale * Time.deltaTime);
		yield WaitForFixedUpdate ();
	}
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

function _ReverseWheel () {
	direction = Vector3(0, Wheel.direction, 0) * speed;
}
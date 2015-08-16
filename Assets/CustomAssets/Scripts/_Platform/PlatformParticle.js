#pragma strict

@HideInInspector
var center : Transform;
@HideInInspector
var speed : float;

private var myTransform : Transform;
private var direction : int;

function Start () {
	myTransform = transform;
	direction = Wheel.direction;
	Messenger.instance.Listen("reverse_wheel", this);
}

function OnEnable () {
	direction = Wheel.direction;
}

function FixedUpdate () {
	//if (center != null)
		//myTransform.RotateAround(center.position, direction * speed * Time.deltaTime * TimeController.timeScale);
}

function _ReverseWheel () {
	direction = Wheel.direction;
}
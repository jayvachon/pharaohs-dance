#pragma strict

var center : Transform;
var speed : float = 7.0;

private var myTransform : Transform;

function Start () {
	myTransform = transform;
}

/*function FixedUpdate () {
	myTransform.RotateAround(center.position, Vector3.left, speed * Time.deltaTime);
}*/
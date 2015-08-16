#pragma strict

var center : Transform;
var speed : float = 7.0;
private var motor : CharacterMotor;

private var myTransform : Transform;
private var playerPosition : Vector3;
private var player : GameObject;

function Start () {
	myTransform = transform;
	renderer.material.color = CustomColor.black;
	
	player = GameObject.FindGameObjectWithTag("Player");
	motor = player.GetComponent(CharacterMotor);
}

function FixedUpdate () {
	myTransform.RotateAround(center.position, Vector3(Wheel.direction * -1, 0, 0), speed * Time.deltaTime);
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Net") {
		player.transform.parent = myTransform;
	}
}

function OnTriggerExit (other : Collider) {
	if (other.tag == "Net") {
		player.transform.parent = null;
	}
}
#pragma strict
#pragma downcast

//var startPlatform : Transform;

private var player : Transform;
private var myTransform : Transform;
private var startPosition : Vector3;

private var pointer : Transform;

private var movement : CharacterMotorMovement;
private var parachuting : boolean = false;

private var left : boolean = false;
private var vertical : boolean = false;
private var up : boolean = false;

function Awake () {

	myTransform = transform;
	
	player = GameObject.FindGameObjectWithTag("Player").transform;
	movement = player.gameObject.GetComponent(CharacterMotor).movement;
	
	for (var child : Transform in transform) {
		if (child.name == "StartPointer") {
			pointer = child;
		}
	}
	
	InvokeRepeating("CheckPlayerVelocity", 0.0, 0.5);
}

function Start () {
	Messenger.instance.Listen("deploy_parachute", this);
	Messenger.instance.Listen("retract_parachute", this);
}

function CheckPlayerVelocity () {
	var vel : float = GetPlayerVelocity();
	if (vel < -35.0 || parachuting || player.position.y < 0.0) {
		if (PlayerInPosition()) {
			StartAnimation();
		} else {
			StopAnimation();
		}
	} else if (vel > -35.0 && player.position.y > 0.0){
		StopAnimation();
	}
}

function GetPlayerVelocity () {
	return movement.velocity.y;
}

function PlayerInPosition () : boolean {
	
	var px : float = player.position.x;
	var pz : float = player.position.z;
	var py : float = player.position.y;
	
	if (vertical) {
		if (up) {
			if (px > 20.0) {
				return true;
			} 
			return false;
		} else {
			if (py < 0.0 && px < 8.0) {
				return true;
			}
			if (px < 10.0) {
				return true;
			}
			return false;
		}
	} else {
		if (left) {
			if (pz > 8.0) {
				return true;
			}
			return false;
		} else {
			if (pz < -8.0) {
				return true;
			}
			return false;
		}
	}
}

function Initiate (l : boolean, v : boolean, u : boolean) {
	
	left = l;
	vertical = v;
	up = u;
	
	var x : int = -20;
	
	if (vertical) {
		if (up) {
			pointer.localPosition = Vector3(x, 40, 0);
			pointer.localEulerAngles = Vector3(0, 0, 270);
		} else {
			pointer.localPosition = Vector3(x, -40, 0);
			pointer.localEulerAngles = Vector3(0, 0, 90);
		}
	} else {
		if (left) {
			pointer.localPosition = Vector3(x, 0, -40);
			pointer.localEulerAngles = Vector3(306, 90, 180);
		} else {
			pointer.localPosition = Vector3(x, 0, 40);
			pointer.localEulerAngles = Vector3(270, 90, 0);
		}
	}
	
	pointer.animation["StartPointerPulse"].time = 0.5;
	pointer.renderer.material.color.a = 0.0;
}

function StartAnimation () {
	if (!pointer.animation.isPlaying) {
		pointer.animation["StartPointerPulse"].time = 0.5;
		pointer.animation.Play("StartPointerPulse");
	}
}

function StopAnimation() {
	if (pointer.animation.isPlaying) {
		while (pointer.renderer.material.color.a > 0.01) {
			yield;
		}
		pointer.animation.Stop();
		pointer.renderer.material.color.a = 0.0;
	}
}

function _DeployParachute () {
	parachuting = true;
}

function _RetractParachute () {
	parachuting = false;
}
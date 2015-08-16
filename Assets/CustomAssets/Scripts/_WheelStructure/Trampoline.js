#pragma strict

var speed : float = 70.0;
private var player : GameObject;
private var playerScript : Player;
private var motor : CharacterMotor;
private var movement : CharacterMotorMovement;
private var startGravity : float;

private var shader1 : Shader;
private var shader2 : Shader;
private var solid : Color;
private var trans : Color;

private var myTransform : Transform;
private var stationary : boolean = false;

function Awake () {
	myTransform = transform;
}

function Start () {

	player = GameObject.FindGameObjectWithTag("Player");
	playerScript = player.GetComponent(Player);
	motor = player.GetComponent(CharacterMotor);
	movement = player.GetComponent(CharacterMotor).movement;
	startGravity = movement.gravity;
	
	ColorTrampoline (3);
	
	Messenger.instance.Listen("restart_game", this);
	
	/*shader1 = Shader.Find("Diffuse");
	shader2 = Shader.Find("Transparent/Diffuse");
	
	solid = CustomColor.green + CustomColor.black;
	trans = CustomColor.green + CustomColor.black;
	trans.a = 0.5;*/
	
	// hack that sets platforms to stationary based on their bounce speed
	if (speed >= 70.0) {
		stationary = true;
	}
	
	Invoke("SetLayer", 1);
}

function ColorTrampoline (ci : int) {
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.colorProgression[ci] + CustomColor.black);
}

function SetLayer () {
	gameObject.layer = transform.parent.gameObject.layer;
}

function DisableCollider () {
	collider.enabled = false;
}

function EnableCollider () {
	collider.enabled = true;
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Net") {
		playerScript.RetractParachute();
		var grav : float = 0.0;
		if (stationary && movement.gravity > startGravity) {
			grav = Mathf.Abs(startGravity - movement.gravity) / 2.0;
		}
		motor.SetVelocity(Vector3.up * (speed + grav));
		animation.Play("TrampolineBounce");
		new MessageTrampolineBounce ();
	}
}

function GetPlayerVelocity () {
	return (player.GetComponent(CharacterController).velocity.y);
}

function _RestartGame () {
	Invoke("SetLayer", 1);
}
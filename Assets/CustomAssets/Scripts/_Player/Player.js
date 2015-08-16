#pragma strict
#pragma downcast

private var startPosition : Vector3;

// Parachute
@HideInInspector
var gravityCoefficient : float = 1.0;			// Strength of parachute against gravity
private var GRAVITY : float;					// Default gravity
private var maxFallSpeed : float;				// Default max fall speed
private var parachuteVelocity : float; 			// At what velocity to deploy the parachute
@HideInInspector
public var parachuting : boolean = false;		// Is the parachute deployed?
private var cancelParachute : boolean = false;  // The player can "jump" when the parachute is deployed to retract it
private var sendFallMessage : boolean = true;

// CharacterController classes
private var controller : CharacterController;
private var movement : CharacterMotorMovement;
private var input : FPSInputController;
private var movingPlatform : CharacterMotorMovingPlatform;
private var jumping : CharacterMotorJumping;
private var motor : CharacterMotor;

// Rotation with movement
private var maxVel : float;
private var maxFall : float;
private var maxRot : float = 50.0;

private var myTransform : Transform;
private var yVel : float = 0.0;
private var startBaseHeight : float;
private var startExtraHeight : float;

// Crystal collection
private var fullGravity : float;
private var stomachGravity : float = 0.0;		// Added to GRAVITY constant based on how full the stomach is
private var interval : float;

// Air
@HideInInspector
var air : float = 1.0;
private var airAmount : float = 0.0;
private var airDuration : float = 60.0;	// By default, how long it takes to deplete air to 0 (in seconds)
private var screenUp : boolean = false;
private var subtractingAir : boolean = false;

private var ring : GameObject;

var jumpSound : AudioClip;

private var piping : boolean = false;

function Awake () {
	myTransform = transform;
	startPosition = myTransform.position;
	
	// Parachute
	GRAVITY = GetGravity();
	maxFallSpeed = GetMaxFallSpeed();
	
	// Crystal collection
	fullGravity = GRAVITY + (GRAVITY * 0.5);
	
	// CharacterController classes
	controller = GetComponent(CharacterController);
	movement = GetComponent(CharacterMotor).movement;
	input = GetComponent(FPSInputController);
	movingPlatform = GetComponent(CharacterMotor).movingPlatform;
	jumping = GetComponent(CharacterMotor).jumping;
	motor = GetComponent(CharacterMotor);
	
	// These are used to give the player some rotational movement when moving
	maxVel = movement.maxForwardSpeed;
	maxFall = movement.maxFallSpeed;
	
	// Jumping
	startBaseHeight = jumping.baseHeight;
	startExtraHeight = jumping.extraHeight;
	
	for (var child : Transform in myTransform) {
		if (child.tag == "PlayerRing") {
			ring = child.gameObject;
		}
	}
	
	screenUp = true;
}

function Start () {
	Messenger.instance.Listen("update_inventory", this);
	Messenger.instance.Listen("nearest_center", this);
	Messenger.instance.Listen("collect_coin", this);
	Messenger.instance.Listen("collect_reverser", this);
	Messenger.instance.Listen("collect_pill", this);
	Messenger.instance.Listen("collect_crystal", this);
	Messenger.instance.Listen("add_crystal", this);
	Messenger.instance.Listen("empty_stomach", this);
	Messenger.instance.Listen("restart_game", this);
	
	Messenger.instance.Listen("open_tutorial", this);
	Messenger.instance.Listen("close_tutorial", this);
	Messenger.instance.Listen("open_startscreen", this);
	Messenger.instance.Listen("close_startscreen", this);
	Messenger.instance.Listen("open_screen", this);
	Messenger.instance.Listen("close_screen", this);
	
	Messenger.instance.Listen("update_air", this);
	Messenger.instance.Listen("enter_end", this);
	Messenger.instance.Listen("exit_end", this);
	
	Messenger.instance.Listen("collect_airbonus", this);
	Messenger.instance.Listen("collect_crystal1", this);
	Messenger.instance.Listen("collect_crystal2", this);
	Messenger.instance.Listen("collect_crystal3", this);
	Messenger.instance.Listen("collect_crystal4", this);
	Messenger.instance.Listen("collect_crystal5", this);
	Messenger.instance.Listen("collect_crystal6", this);
	Messenger.instance.Listen("collect_crystal7", this);
	
	Messenger.instance.Listen("begin_pipe", this);
	Messenger.instance.Listen("end_pipe", this);
	
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
	
	parachuteVelocity = -(GetMaxFallSpeed() / 1.5);
	
	SetInterval(Inventory.instance.GetItemValue(Item.stomach));
	
	input.stop = true;
	
	InvokeRepeating("SubtractAir", 0.0, 1.0);
	InvokeRepeating("CheckDeployParachute", 0.0, 0.25);
	InvokeRepeating("CheckRetractParachute", 0.0, 0.25);
	InvokeRepeating("SetMovingPlatform", 0.0, 0.25);
	InvokeRepeating("AnimateMovement", 0.0, 0.005);
	InvokeRepeating("FallingMusic", 0.0, 0.5);
	subtractingAir = true;
}

function Update () {
	
	if (!input.enabled || input.stop)
		return;
		
	if (Input.GetButtonDown("Jump")) {
		if (controller.isGrounded && !input.stop) {
			animation.Play("PlayerJump");
			new MessagePlayerJump ();
		}
		if (parachuting) {
			cancelParachute = true;
			RetractParachute (false);
		} else if (cancelParachute) {
			cancelParachute = false;
			DeployParachute ();
		}
	}
}

function FallingMusic () {
	if (GetVelocityY() < parachuteVelocity) {
		AudioManager.PlayElement("Falling", new PlaySettings (AudioManager.GetMetronome ("Main"), SnapStyle.BeatInMeasure, 1, true, 7.5));
	} else {
		AudioManager.StopElement("Falling", new StopSettings (7.5));
	}
}

function AnimateMovement () {
	// Give the player some rotational movement when moving
	if (!input.enabled || input.stop)
		return;
	
	yVel = Mathf.Lerp(yVel, controller.velocity.y, 0.75); 
	
	if (Mathf.Abs(yVel) > maxFall / 2) {
		yVel = Mathf.Abs(yVel) - maxFall;
	}	
	yVel /= maxFall;
	yVel = Mathf.Min(yVel, 1.0);
	
	var zVel = Mathf.Min(controller.velocity.z / maxVel, 1.0);
	var xVel = Mathf.Min(controller.velocity.x / maxVel, 1.0);
	myTransform.eulerAngles.x = (zVel) * maxRot * yVel;
	myTransform.eulerAngles.z = (xVel) * -maxRot * yVel;
	
	myTransform.localEulerAngles.y = 0.0;
}

function SetMovingPlatform () {

	if (parachuting || cancelParachute)
		return;

	if (controller.isGrounded || GetVelocityY() > parachuteVelocity || piping) {
		EnableMovingPlatform();
	} else {
		DisableMovingPlatform ();
	}
}

function _BeginPipe () {
	piping = true;
}

function _EndPipe () {
	yield WaitForSeconds (0.25);
	piping = false;
}

function CheckDeployParachute () {
	if (Inventory.instance.GetItemValue(Item.parachute) == 0 || parachuting || GetVelocityY() > parachuteVelocity || cancelParachute || piping)
		return;
	DeployParachute ();
}

function DeployParachute () {
	parachuting = true;
	DisableMovingPlatform ();
	SetGravity (GetGravity() * gravityCoefficient);
	SetMaxFallSpeed (maxFallSpeed * gravityCoefficient);
	new MessageDeployParachute ();
}

function CheckRetractParachute () {
	if (controller.isGrounded)
		cancelParachute = false;
	if (Inventory.instance.GetItemValue(Item.parachute) == 0 || !parachuting || !controller.isGrounded)
		return;
	RetractParachute ();
}

function RetractParachute (enableMovingPlatform : boolean) {
	if (!parachuting) // this function is called from other objects so we need to double check
		return;
	parachuting = false;
	if (enableMovingPlatform)
		EnableMovingPlatform ();
	ResetGravity ();
	SetMaxFallSpeed (maxFallSpeed);
	new MessageRetractParachute ();
}

function RetractParachute () {
	RetractParachute (true);
}

function EnableMovingPlatform () {
	movingPlatform.enabled = true;
}

function DisableMovingPlatform () {
	movingPlatform.enabled = false;
	movingPlatform.activePlatform = null;
}

function SetGravity (g : float) {
	movement.gravity = g + stomachGravity;
}

function GetGravity () {
	return GetComponent(CharacterMotor).movement.gravity + stomachGravity;
}

function SetMaxFallSpeed (m : float) {
	movement.maxFallSpeed = m;
}

function GetMaxFallSpeed () {
	return GetComponent(CharacterMotor).movement.maxFallSpeed;
}

function GetVelocityY () {
	return GetComponent(CharacterMotor).movement.velocity.y;
}

// Crystal collection

function SetInterval (stomachSize : int) {
	interval = (fullGravity - GRAVITY) / (stomachSize + 0.0);	
}

function AddGravity (crystal : int) {
	// amount added is determined by type of crystal collected (higher value = larger percentage of interval)
	if (!Inventory.instance.IsStomachFull()) {
		stomachGravity += interval * ((crystal + 0.0) / (6 + 0.0));
		movement.gravity = GRAVITY + stomachGravity;
	}
}

function ResetGravity () {
	movement.gravity = GRAVITY + stomachGravity;
}

function ResetStomach () {
	stomachGravity = 0.0;
	ResetGravity();
}

function IsGrounded () {
	return controller.isGrounded;
}

// ------------------------------------------------------ Air ------------------------------------------------------ //

function SubtractAir () {

	if (screenUp || input.stop || !input.enabled)
		return;

	airAmount += 1.0;
	air = Mathf.Lerp(1.0, 0.0, airAmount / airDuration);
	new MessageUpdateAir();
	
}

function ResetAir () {
	
	CancelInvoke("SubtractAir");
	subtractingAir = false;
	
	var eTime : float = 0.0;
	var time : float = 0.5;
	var startAir : float = air;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		air = Mathf.Lerp(startAir, 1.0, eTime / time);
		new MessageUpdateAir();
		yield;
	}
	
	airAmount = 0.0;
	
	if (!subtractingAir) {
		InvokeRepeating("SubtractAir", 1.0, 1.0);
		subtractingAir = true;
	}
}

function Suffocate () {

	controller.enabled = false;
	input.enabled = false;
	
	animation.Stop();
	animation.Play("SuffocatePlayer");
	
	yield WaitForSeconds(animation["SuffocatePlayer"].length);
	
	new MessagePlayerDied();
	
	air = 1.0;
	airAmount = 0.0;
}

function IsAirEmpty () {
	return air <= 0.0;
}

function MoveToStart () {
	motor.SetVelocity(Vector3.zero);
	myTransform.position = startPosition;
	controller.enabled = false;
	yield WaitForSeconds(3.0);
	controller.enabled = true;
}

// Messages
function _UpdateInventory () {
	yield WaitForFixedUpdate();
	
	// Parachute
	gravityCoefficient = (6 - Inventory.instance.GetItemValue(Item.parachute)) * 0.20;
	
	// Stomach
	SetInterval(Inventory.instance.GetItemValue(Item.stomach));
	
	// Air
	airDuration = Inventory.instance.GetItemValue(Item.air);
}

function _NearestCenter () {
	
	var newRot : float;
	switch (Wheel.nearestCenter.eulerAngles.normalized) {
		case Vector3.right : newRot = 0; break;
		case Vector3.forward : newRot = 270; break;
	}
	myTransform.eulerAngles.y = newRot;
	
}

function _CollectCoin () {
	PulsePlayer();
}

function _CollectReverser () {
	PulsePlayer();
}

function _CollectPill () {
	PulsePlayer();
}

function _CollectCrystal () {
	PulsePlayer();
}

function PulsePlayer () {
	if (!animation.isPlaying) {
		animation.Play("PulsePlayer");
	}
}

function _AddCrystal () {
	yield WaitForEndOfFrame();
	if (!Inventory.instance.IsStomachFull()) {
		//AddGravity(interval);
	}
}

function _CollectAirbonus () {
	PulsePlayer();
	ResetAir();
}

// Crystals
function _CollectCrystal1 () {
	AddGravity(1);
}

function _CollectCrystal2 () {
	AddGravity(2);
}

function _CollectCrystal3 () {
	AddGravity(3);
}

function _CollectCrystal4 () {
	AddGravity(4);
}

function _CollectCrystal5 () {
	AddGravity(5);
}

function _CollectCrystal6 () {
	AddGravity(6);
}

function _CollectCrystal7 () {
	new MessageEmptyStomach();
}

function _EmptyStomach () {
	ResetStomach();
}

function _RestartGame () {

	air = 1.0;
	airAmount = 0.0;
	airDuration = 60.0;
	
	yield WaitForFixedUpdate();
	myTransform.localScale = Vector3 (1.25, 1.25, 1.25);
	ResetStomach();
	SetInterval(Inventory.instance.GetItemValue(Item.stomach));
	
	MoveToStart ();
}

function ResetPosition () {
	myTransform.position = startPosition;
}

function _OpenTutorial () {
	input.stop = true;
	screenUp = true;
}

function _CloseTutorial () {
	input.stop = false;
	screenUp = false;
}

function _OpenStartcreen () {
	screenUp = true;
}

function _CloseStartscreen () {
	input.stop = false;
	screenUp = false;
}

function _OpenScreen () {
	screenUp = true;
}

function _CloseScreen () {
	screenUp = false;
}

function _UpdateAir () {
	if (air <= 0.0) {
		Suffocate();
	}
}

function _EnterEnd () {
	screenUp = true;
}

function _ExitEnd () {
	screenUp = false;
}

function _SaveGame () {
	PulsePlayer ();
	SaveGameManager.SaveFloat ("player_gravity", GetGravity());
}

function _LoadGame () {
	air = 1.0;
	airAmount = 0.0;
	airDuration = 60.0;
	MoveToStart ();
	SetGravity (SaveGameManager.LoadFloat ("player_gravity"));
}
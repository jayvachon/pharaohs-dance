#pragma strict

@HideInInspector
var myStep : int = 0;
private var transparent : boolean = true;
private var startHeight : float = 0.1;
private var interval : int;
private var rowScale : float = 0.55555;		// The scale at which this pipe = 1 row

private var piping : boolean = false;

private var player : Transform;
private var input : FPSInputController;
private var controller : CharacterController;
private var motor : CharacterMotor;

private var playerInPipe : boolean = false;

private var myTransform : Transform;
private var yTop : float;
private var height : float;

//@HideInInspector
var activated : boolean = false;

function Awake () {
	myTransform = transform;
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
	input = player.GetComponent(FPSInputController);
	controller = player.GetComponent(CharacterController);
	motor = player.GetComponent(CharacterMotor);
	
	renderer.materials[0].color = CustomColor.black;
	
	interval = Mathf.RoundToInt((Wheel.rows + 0.0) / (Wheel.columns + 0.0));
	startHeight = myTransform.localScale.y;
	SetScale();
	EnableRenderer ();
	
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
}

function EnableRenderer () {
	yield WaitForFixedUpdate ();
	renderer.enabled = true;
}

function SetScale () {
	
	while (myStep == 0) {
		yield;
	}
	
	// myStep 6 must = Wheel.rows + 1
	// columns increase by 3
	var rows : int = (Wheel.rows - Wheel.pipeOnlyRows) + 1 + (myStep * 2);
	//if (myStep == 6)
		//rows ++;
	myTransform.localScale.y = rowScale * rows;
	yTop = Wheel.radius * (rows);// - (Wheel.pipeOnlyRows / 6.0));
	yTop += myTransform.position.y;
	
}

function Update () {
	
	if (input.stop) return;
	
	if (Input.GetButtonDown("Jump")) {
		if (playerInPipe && activated) {
			PipePlayer();
		}
	}
}

function OnTriggerEnter (other : Collider) {
	if (activated && controller.isGrounded) {
		FadeIn();
		playerInPipe = true;
	}
}

function OnTriggerExit (other : Collider) {
	if (activated) {
		FadeOut();
		playerInPipe = false;
	}
}

function FadeIn () {
	if (transparent) {
		animation["StepPipeFade"].speed = -1;
		animation["StepPipeFade"].time = animation["StepPipeFade"].length;
		animation.Play("StepPipeFade");
		myTransform.parent.GetComponent(Step).FadeIn();
		transparent = false;
	}
}

function FadeOut () {
	if (!transparent) {
		animation["StepPipeFade"].speed = 1;
		animation["StepPipeFade"].time = 0.0;
		animation.Play("StepPipeFade");
		myTransform.parent.GetComponent(Step).FadeOut();
		transparent = true;
	}
}

function SlowTime () {
	TimeController.instance.AddToTimeScale(myStep);
	SendCollectMessage(myStep);
}

function SendCollectMessage (t : int) {

	new MessageCollectPill();
	switch (t) {
		case 1 : new MessageCollectPill1(); break;
		case 2 : new MessageCollectPill2(); break;
		case 3 : new MessageCollectPill3(); break;
		case 4 : new MessageCollectPill4(); break;
		case 5 : new MessageCollectPill5(); break;
		case 6 : new MessageCollectPill6(); break;
		case 7 : new MessageCollectPill7(); break;
	}
	
}

function PipePlayer() {
	
	AudioManager.PlayElement("EndPipe", new PlaySettings (AudioManager.GetMetronome("Main"), SnapStyle.BeatInMeasure, 1, true, 2.0));
	
	input.stop = true;
	
	var scale : Vector3 = player.localScale;
	var pipeScale : Vector3 = myTransform.localScale;
	var playerRotation : Vector3 = Vector3.zero;
	
	var startPosition : Vector3 = myTransform.parent.GetComponent(Step).center;
	var playerStart : Vector3 = player.position;
	startPosition.y = playerStart.y;
	
	//player.position = startPosition;
	
	var eTime : float = 0.0;
	var time : float = 0.15;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		player.position = Vector3.Lerp(playerStart, startPosition, eTime / time);
		yield;
	}
	
	var vel : float = 0.0;
	while (player.position.y < yTop) {
		motor.SetVelocity(Vector3.up * (10.0 + vel));
		if (vel < 50.0) {
			vel += 0.5;
		}
		
		yield;
	}
	
	input.stop = false;
	playerInPipe = false;
	SlowTime();
	FadeOut();
	
	AudioManager.StopElement ("EndPipe", new StopSettings (AudioManager.GetMetronome ("Main"), 1.0, 2.0));
}

function _SaveGame () {
	var id : String = "endPipe" + myStep.ToString ();
	SaveGameManager.SaveBool (id + "_activated", activated);
}

function _LoadGame () {
	var id : String = "endPipe" + myStep.ToString ();
	activated = SaveGameManager.LoadBool (id + "_activated");
}
#pragma strict
#pragma downcast

var transporter : GameObject;
private var myTransporter : GameObject;

private var player : Transform;
private var yScaleMax : float;
private var height : float;
private var myTransform : Transform;
private var input : FPSInputController;
private var motor : CharacterMotor;
private var controller : CharacterController;
private var movement : CharacterMotorMovement;
private var movingPlatform : CharacterMotorMovingPlatform;

private var column : int = -1;

private var endPipe : boolean = false;
private var endPipeScale : float;
private var startScale : float;
private var parent : Platform;

private var doublePipe : boolean = false;
private var timeScale : float = 1.0;
private var playerInPipe : boolean = false;
private var piping : boolean = false;
private var canPipe : boolean = true;

private var body : GameObject;
var meshDouble : Mesh;

function Awake () {

	myTransform = transform;
	yScaleMax = 0.1; 
	myTransform.localScale.y = 0.0;
	
	player = GameObject.Find("Player").transform;
	input = player.GetComponent(FPSInputController);
	motor = player.GetComponent(CharacterMotor);
	controller = player.GetComponent(CharacterController);
	movement = player.GetComponent(CharacterMotor).movement;
	movingPlatform = player.GetComponent(CharacterMotor).movingPlatform;
	
	parent = null;
	ColorPipe(CustomColor.yellow, parent);
	
	for (var child : Transform in myTransform) {
		if (child.tag == "End") {
			child.renderer.enabled = false;
		}
		if (child.tag == "PipeBody") {
			body = child.gameObject;
		}
	}
	startScale = yScaleMax;
	endPipeScale = 0.5;
}

function Start () {
	Messenger.instance.Listen("create_pipe", this);
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("begin_pipe", this);
	Messenger.instance.Listen("end_pipe", this);
	Messenger.instance.Listen("create_donut", this);
	height = yScaleMax * (Wheel.radius * 10.0);
}

function Update () {
	
	if (Input.GetButtonDown("Jump")) {
		
		if (!piping && !input.stop) {
			if (PlayerInPipe()) {
				PipePlayer();
			}
			if (PlayerUnderPipe()) {
				PipePlayerReverse();
			}
		}
		
	}
}

function PipePlayer () {
	
	piping = true;
	new MessageBeginPipe();
	
	var playerRotation : Quaternion = player.transform.rotation;
	var scale : Vector3 = player.transform.localScale;
	var animationLength : float = player.animation["PipePlayer"].clip.length;

	// Don't allow the player to move the player while piping
	input.stop = true;
	
	// Move the player into the center of the pipe
	var time : float = 0.15;
	var elapsedTime : float = 0.0;
	var startPosition : Vector3 = player.transform.position;
	
	var platform : Platform = transform.parent.GetComponent(Platform);	
	var center = platform.center;	
	var rot : float = (myTransform.eulerAngles.x * Mathf.Deg2Rad) + (((platform.speed * Mathf.Deg2Rad) * time) * Wheel.direction * TimeController.timeScale);	
	var hyp : float = ((platform.row + 1) * height) + 2.0;
	var endPosition : Vector3 = Vector3(center.position.x, center.position.y + Mathf.Cos(rot) * hyp, center.position.z + Mathf.Sin(rot) * hyp);
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		player.transform.position = Vector3.Lerp(startPosition, endPosition, elapsedTime / time);
		player.transform.rotation = Quaternion.Lerp(playerRotation, myTransform.rotation, elapsedTime / time);
		yield;
	}
		
	// Begin the animation
	var pipeScale : Vector3 = myTransform.localScale;
	player.transform.parent = transform;	
	//player.transform.localScale = Vector3(scale.x / pipeScale.x, scale.y / pipeScale.y, scale.z / pipeScale.z);
	var py : float = 0.1;
	if (doublePipe)
		py *= 2;
	player.transform.localScale = Vector3(scale.x / 0.05, scale.y / py, scale.z / 0.05);
	player.transform.localEulerAngles = Vector3.zero;
	player.animation.Play("PipePlayer");
	
	yield WaitForSeconds(animationLength / 1.75);
	
	// Halfway through, send a message saying that we're in a pipe
	new MessagePipePlayer();
	
	// This is a hack, but if the animation is allowed to play all the way out the player gets shot away violently, so we cut it short
	var secondWait : float = animationLength / 2.33;
	if (doublePipe) {
		secondWait -= 0.33;
	}
	yield WaitForSeconds(secondWait);
	
	// End the animation
	player.animation.Stop("PipePlayer");
	player.transform.parent = null;
	player.transform.localScale = scale;
	
	// Reactivate the controller and colliders... because they get deactivated for some reason
	controller.enabled = true;
	yield WaitForFixedUpdate();
	for (var i : Transform in player.transform) {
		if (i.tag == "Net")
			i.collider.enabled = true;
	}
	
	//StartCoroutine(RotatePlayer(0.25, myTransform.rotation, playerRotation));
	player.transform.rotation = playerRotation;
	input.stop = false;
	
	piping = false;
	
	new MessageEndPipe();
	
}

function PipePlayerReverse () {
	
	piping = true;
	new MessageBeginPipe();
	
	var playerRotation : Quaternion = player.transform.rotation;
	var scale : Vector3 = player.transform.localScale;
	var animationLength : float = player.animation["PipePlayerReverse"].clip.length;

	// Don't allow the player to move the player while piping
	input.stop = true;
	
	// Move the player into the center of the pipe
	var time : float = 0.1;
	var elapsedTime : float = 0.0;
	var startPosition : Vector3 = player.transform.position;
	
	var platform : Platform = transform.parent.GetComponent(Platform);	
	var center = platform.center;	
	var rot : float = (myTransform.eulerAngles.x * Mathf.Deg2Rad) + (((platform.speed * Mathf.Deg2Rad) * time) * Wheel.direction * TimeController.timeScale);	
	var hyp : float = (((platform.row + 2) * height) - 2.0);
	var endPosition : Vector3 = Vector3(center.position.x, center.position.y - Mathf.Cos(rot) * hyp, center.position.z + Mathf.Sin(rot) * hyp);
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		player.transform.position = Vector3.Lerp(startPosition, endPosition, elapsedTime / time);
		yield;
	}
		
	// Begin the animation
	var pipeScale : Vector3 = myTransform.localScale;
	player.transform.parent = transform;	
	player.transform.localScale = Vector3(scale.x / pipeScale.x, scale.y / pipeScale.y, scale.z / pipeScale.z);
	//player.transform.localEulerAngles = Vector3.zero;
	player.animation.Play("PipePlayerReverse");
	
	yield WaitForSeconds(animationLength / 2);
	
	// Halfway through, send a message saying that we're in a pipe
	new MessagePipePlayer();
	
	// This is a hack, but if the animation is allowed to play all the way out the player gets shot away violently, so we cut it short
	var secondWait : float = animationLength / 2;
	if (doublePipe) {
		secondWait -= 0.33;
	}
	yield WaitForSeconds(secondWait);
	
	// End the animation
	player.animation.Stop("PipePlayerReverse");
	player.transform.parent = null;
	player.transform.localScale = scale;
	
	// Reactivate the controller and colliders... because they get deactivated for some reason
	controller.enabled = true;
	yield WaitForFixedUpdate();
	for (var i : Transform in player.transform) {
		if (i.tag == "Net")
			i.collider.enabled = true;
	}
	
	//StartCoroutine(RotatePlayer(0.25, Quaternion.Inverse(myTransform.rotation), playerRotation));
	player.transform.rotation = playerRotation;
	input.stop = false;
	
	piping = false;
	
	new MessageEndPipe();
}

// --------------------------------------- // Enabling & Disabling // -------------------------------------- //

function OnEnable () {
	InheritQualities();
}

function InheritQualities () {
	
	if (myTransform.position != ObjectBase.instance.transform.position) {
	
		// Wait until we've found our parent
		while (myTransform.parent == null) {
			yield;
		}
		
		collider.enabled = true;
		
		SetParent();
		SetDoublePipe();
		SetColumn();
		SetColor();
		StartGrow();
		SetLayer();
		
	}	
}

function SetParent () {
	parent = myTransform.parent.GetComponent(Platform);
}

function SetDoublePipe () {
	doublePipe = parent.doublePipe;
	if (doublePipe) {
		body.transform.localPosition.y = 1.5;
		body.GetComponent(MeshFilter).mesh = meshDouble;
	}
}

function SetColumn () {
	if (!doublePipe) {
		column = parent.column;
	}
}

function SetColor () {
	ColorPipe(CustomColor.yellow, parent);
}

function SetLayer () {
	gameObject.layer = myTransform.parent.gameObject.layer;
	myTransform.GetChild(0).gameObject.layer = gameObject.layer;
}

/*function RemoveEndPipe () {
	if (endPipe) {
		myTransporter.transform.parent = null;
		ObjectBase.instance.Destroy(myTransporter);
		endPipe = false;
	}
}*/

/*function SetEndPipe () {

	var newScale : float;
	
	if (parent.row == Wheel.rows - 1) {
		endPipe = true;
		for (var child : Transform in myTransform) {
			if (child.tag == "End") {
				myTransporter = ObjectBase.instance.Instantiate(transporter, child.position);
				myTransporter.transform.parent = myTransform;
			}
		}
	}
}*/

function OnDisable () {
	myTransform.localScale.y = 0.0;
}

function ColorPipe (newColor : Color, platform : Platform) {
	for (var child : Transform in myTransform) {
		if (child.name != "End") {
			
			var secondary : Color = CustomColor.yellow;
			if (!doublePipe) {
				secondary = Wheel.instance.GetColumnColor(column);
				if (secondary.a == 0.99) {
					secondary = CustomColor.black;
				}
			}
			newColor.a = 0.85;
			secondary.a = 0.85;
			var c : Color[] = [ CustomColor.black, secondary, newColor ];
			child.renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
		}
	}
}

// ------------------------------------------- // Coroutines // ------------------------------------------- //

// Creation
function StartGrow () {
	while (myTransform.parent == null) {
		yield;
	}
	
	var hasPipe = parent.hasPipe;
	if (hasPipe) {
		if (doublePipe) {
			myTransform.localScale.y = yScaleMax * 2.0;
		} else {
			myTransform.localScale.y = yScaleMax;
		}
	} else {
		//StartCoroutine(Grow());
		
		timeScale = TimeController.timeScale;
		if (doublePipe) {
			animation["DoublePipeGrow"].speed = Mathf.Lerp(0.25, 1, TimeController.timeScale);
			animation.Play("DoublePipeGrow");
		} else {
			animation["PipeGrow"].speed = Mathf.Lerp(0.25, 1, TimeController.timeScale);
			animation.Play("PipeGrow");
		}
		parent.hasPipe = true;
	}
}

// Piping player
/*function MovePlayerThroughPipe () {

	input.stop = true;
	MainCamera.fixedUpdate = false;
	
	if (endPipe)
		new MessageStopDeactivating();
	var playerRotation = player.transform.localRotation;
	
	yield StartCoroutine(RotatePlayer(0.25, player.transform.localRotation, myTransform.rotation));
	yield StartCoroutine(MovePlayer(1.0));
	StartCoroutine(RotatePlayer(0.25, myTransform.rotation, playerRotation));
	
	MainCamera.fixedUpdate = true;
	if (!endPipe) {
		input.stop = false;
	} else {
		//StartCoroutine(HoldPlayer());
	}
	
}*/

// Piping player
/*function MovePlayerThroughPipeReverse () {

	input.stop = true;
	MainCamera.fixedUpdate = false;

	var playerRotation = player.transform.localRotation;
	
	//yield StartCoroutine(RotatePlayer(0.25, player.transform.localRotation, myTransform.rotation));
	yield StartCoroutine(MovePlayerReverse(1.0));
	//StartCoroutine(RotatePlayer(0.25, myTransform.rotation, playerRotation));
	
	MainCamera.fixedUpdate = true;
	input.stop = false;
	
}*/

/*function RotatePlayer (time : float, startRotation : Quaternion, targetRotation : Quaternion) {
	
	var elapsedTime : float = 0.0;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		player.localRotation = Quaternion.Lerp(startRotation, targetRotation, elapsedTime / time);
		yield;
	}

}*/

/*function MovePlayer (time : float) {
	
	var elapsedTime : float = 0.0;
	var platform : Platform = transform.parent.GetComponent(Platform);	
	var center = platform.center;
	
	var rot : float = (myTransform.eulerAngles.x * Mathf.Deg2Rad) + (((platform.speed * Mathf.Deg2Rad) * time) * Wheel.direction.x * TimeController.timeScale);
	
	var hyp : float = ((platform.row + 2) * height) + 3.5;
	var endPosition : Vector3 = Vector3(center.position.x, center.position.y + Mathf.Cos(rot) * hyp, center.position.z + Mathf.Sin(rot) * hyp);
	
	var startPosition : Vector3 = player.position;
	
	for (var child : Transform in transform) {
		if (child.tag == "End")
			var endPosition : Vector3 = child.transform.position;
	}
	
	var messageSent : boolean = false;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent : float = elapsedTime / time;
		
		for (var child : Transform in transform) {
			if (child.tag == "End")
				endPosition = child.transform.position;
		}
		
		motor.SetVelocity(Vector3.up * 20);	// By doing this, the player will jump up after leaving the pipe
		player.transform.localRotation = myTransform.rotation;
		player.position = Vector3.Lerp(startPosition, endPosition, percent);
		
		if (percent > 0.5 && !messageSent) {
			new MessagePipePlayer();
			messageSent = true;
		}
		
		yield;
	}
}*/

// If the pipe is below the centerpoint, piping happens in reverse
/*function MovePlayerReverse (time : float) {
	var elapsedTime : float = 0.0;
	var startPosition : Vector3 = player.position;
	var endPosition = myTransform.position;
	var messageSent : boolean = false;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent : float = elapsedTime / time;
		endPosition = myTransform.position;
		motor.SetVelocity(Vector3.up * 20);
		//player.transform.localRotation = myTransform.rotation;
		player.position = Vector3.Lerp(startPosition, endPosition, percent);
		
		if (percent > 0.5 && !messageSent) {
			new MessagePipePlayer();
			messageSent = true;
		}
		
		yield;
	}
}*/

// -------------------------------------------- // Misc. // -------------------------------------------- //

function VectorsApproximately (v1 : Vector3, v2 : Vector3, dif : float) {
	if ((v1 - v2).sqrMagnitude <= (v1 * dif).sqrMagnitude) {
		Debug.Log("true");
		return true;
	}else
		return false;
}

function PlayerInPipe () {	
	if (myTransform.eulerAngles.y < 180) {
		var distance : float = Vector3.Distance(myTransform.position, player.position);
		if (distance < 3.5 && player.position.y < myTransform.position.y + 3.0) {
			return true;
		}	
	}
	return false;
}

function PlayerUnderPipe () {
	if (myTransform.eulerAngles.y > 0) {
		for (var child : Transform in transform) {
			if (child.tag == "End") {
				var distance : float = Vector3.Distance(child.position, player.position);
				if (distance < 6.0 && player.position.y > child.position.y - 3.0) {
					return true;
				}
			}
		}
	}
	return false;
}

// ------------------------------------------- // Messages // ------------------------------------------- //

function _CreatePipe () {
	yield WaitForFixedUpdate();
	if (myTransform.parent != null) {
		ColorPipe(parent.pipeColor, parent);
	}
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

function _BeginPipe () {
	canPipe = false;
}

function _EndPipe () {
	canPipe = true;
}

function _CreateDonut () {
	SetColor();
}
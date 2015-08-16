#pragma strict

private var myTransform : Transform;
private var startPosition : Vector3;

private var disable : boolean = false;

function Awake () {
	myTransform = transform;
	
	myTransform.position.y = -(Wheel.rows * Wheel.radius * 1.25);
	
	var newScale : float = (Wheel.rows * Wheel.radius) * 10;
	myTransform.localScale = Vector3(newScale, 1, newScale);
	startPosition = myTransform.position;
}

function Start () {
	//Messenger.instance.Listen("pipe_player", this);
	//Messenger.instance.Listen("restart_game", this);
	
}

function OnTriggerEnter (other : Collider) {
	if (disable)
		return;
	if (other.tag == "Net") {
		//Application.LoadLevel(0);
		//new MessageRestartGame();
		new MessagePlayerDied();
		disable = true;
		Invoke("EndDisable", 5);
	}
}

function EndDisable () {
	disable = false;
}

function _PipePlayer () {
	var newY : float = -(((Wheel.instance.prevNearest.GetComponent(Platform).row + 1) * Wheel.radius) + 5);
	if (newY < myTransform.position.y)
		myTransform.position.y = newY;
}

function _RestartGame () {
	myTransform.position = startPosition;
}
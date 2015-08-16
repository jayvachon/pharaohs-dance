#pragma strict

private var player : Transform;
private var yPos : float;
private var xPos : float;
private var myTransform : Transform;
private var away : boolean = false;
private var child : Trampoline;
private var startPosition : Vector3;

function Awake () {
	myTransform = transform;
	startPosition = myTransform.position;
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
	yPos = myTransform.position.y;
	xPos = myTransform.position.x + 60;

	Messenger.instance.Listen("restart_game", this);
	InvokeRepeating("CheckPlayerPosition", 0.0, 0.5);
}

function CheckPlayerPosition () {
	if (player.position.y < yPos - 2.5 && player.position.x < xPos) {
		Leave();
	} else if (player.position.y > yPos + 5) {
		Return();
	}
}

function Leave () {
	if (!away) {
		animation.Play("FloorLeave");
		away = true;
	}
}

function Return () {
	if (away) {
		animation.Play("FloorReturn");
		yield WaitForSeconds(animation["FloorReturn"].length);
		away = false;
	}
}

function _RestartGame () {
	animation.Stop("FloorReturn");
	animation.Stop("FloorLeave");
	myTransform.position = startPosition;
}
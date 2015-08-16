#pragma strict

private var paused : boolean = false;
private var canPause : boolean = false;				// Certain situations in the game don't allow pausing
private var timeScale : float = 1.0;
private var controller : CharacterController;
private var input : FPSInputController;

private var difficulty : int = 1;

static var instance : GameController;

static var platformTypes : int[] = new int[12];
static var rowValues : int[] = new int[30];

private var shadowsEnabled : boolean = true;

private var screenshotCount : int = 0;

function Awake () {
	Screen.showCursor = false;
	shadowsEnabled = true;
}

function Start () {
	var player : GameObject = GameObject.FindGameObjectWithTag("Player");
	controller = player.GetComponent(CharacterController);
	input = player.GetComponent(FPSInputController);
	
	TimeController.instance.PauseCountDown();
	
	Messenger.instance.Listen("open_tutorial", this);
	Messenger.instance.Listen("close_tutorial", this);
	Messenger.instance.Listen("open_screen", this);
	Messenger.instance.Listen("close_screen", this);
	
	Messenger.instance.Listen("open_startscreen", this);
	Messenger.instance.Listen("close_startscreen", this);
	
	Messenger.instance.Listen("restart_game", this);
	
	Messenger.instance.Listen("player_died", this);
	
	Messenger.instance.Listen("load_game", this);
	
	instance = this;
	
	//PrintValues();
}

function PrintValues () {

	yield WaitForFixedUpdate();
	yield WaitForFixedUpdate();
	yield WaitForFixedUpdate();
	yield WaitForFixedUpdate();
	yield WaitForFixedUpdate();
	
	/*for (var i = 0; i < 11; i ++) {
		Debug.Log("platform " + i + "s = " + platformTypes[i]);
	}*/
	
	for (var i = 0; i < 23; i ++) {
		Debug.Log("row " + i + " value = " + rowValues[i]);
	}
	
}

function Update () {
	
	if (Input.GetKeyDown(KeyCode.Escape)) {
		if (!paused)
			PauseGame(0);
		else
			StartScreen.instance.ResumeGame ();
	}
}

function PauseGame (screen : int) {
	if (!paused && canPause) {
		timeScale = TimeController.timeScale;
		TimeController.timeScale = 0.0;
		TimeController.instance.PauseCountDown();
		new MessageLerpTime();
		new MessageChangeTime();
		controller.enabled = false;
		input.enabled = false;
		if (screen == 0)
			StartScreen.instance.ShowPauseScreen();
		else
			StartScreen.instance.ShowDiedScreen();
		paused = true;
	}
}

function ResumeGame () {
	if (paused) {
		TimeController.timeScale = timeScale;
		TimeController.instance.ResumeCountDown();
		new MessageLerpTime();
		new MessageChangeTime();
		controller.enabled = true;
		input.enabled = true;
		paused = false;
	}
}

function SetDifficulty (d : int) {
	difficulty = d;
	new MessageSetDifficulty();
}

function GetDifficulty () : int {
	return difficulty;
}

function ToggleShadows () {
	shadowsEnabled = !shadowsEnabled;
}

function ShadowsEnabled () : boolean {
	return shadowsEnabled;
}

function _OpenTutorial () {
	canPause = false;
}

function _CloseTutorial () {
	canPause = true;
}

function _OpenScreen () {
	canPause = false;
}

function _CloseScreen () {
	yield WaitForFixedUpdate();
	canPause = true;
}

function _OpenStartscreen () {
	canPause = false;
}

function _CloseStartscreen () {
	TimeController.timeScale = timeScale;
	TimeController.instance.ResumeCountDown();
	canPause = true;
}

function _PlayerDied () {
	PauseGame(1);
}

function _RestartGame () {
	canPause = true;
	paused = false;
	TimeController.timeScale = 0.0;
	TimeController.instance.PauseCountDown();
}

function _LoadGame () {
	canPause = true;
	controller.enabled = true;
	input.enabled = true;
	paused = false;
}
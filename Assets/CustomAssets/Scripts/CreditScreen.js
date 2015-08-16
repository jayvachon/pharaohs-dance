#pragma strict

var endTrampolines : GameObject;
var endStepParent : GameObject;
private var startX : float;
private var endX : float;
private var disX : float;

private var startY : float;
private var endY : float;
private var disY : float;

private var texWhite : Texture2D;
private var texBlack : Texture2D;

private var ending : boolean = false;

private var delay : float = 0.125;
private var fadeLength : float = 0.75;		// How long to fade before the game takes over
private var playerPosition : float = 0.0;	// Percentage of path completed
private var guiAlpha : float = 0.0;

var textStyle : GUIStyle;
private var text : String[] = [ "",
								"A shepherd to the weak",
								"the pharaoh moves westward",
								"quietly humming",
								"his dallying tune \n of remembrance",
								"for Mr. Miles",
								"",
								"Astro Assembly",
								"2013",
								"Jay, Joel & Roy L.",
								"Special Thanks:\nJustin Anderson\nBill Blanchette",
								"Thanks for playing.",
								"" ];
								
private var previousText : int = -1;
private var currentText : int = 0;
private var textAlpha : float = 0.0;
private var fading : boolean = false;

private var blinkColor : Color;

// Window values
private var width : int;
private var height : int;
private var center : int;
private var middle : int;

private var player : Transform;

function Start () {
	
	SetScreenCoordinates();
	GetPlayerTransform();
	SetMessages();	
	CreateTextures();
	//GetXValues();
	GetYValues();
	
}

function GetPlayerTransform () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
}

function SetScreenCoordinates () {
	width = Screen.width;
	height = Screen.height;
	center = width / 2;
	middle = height / 2;
}

function SetMessages () {
	Messenger.instance.Listen("enter_end", this);
	Messenger.instance.Listen("exit_end", this);
	Messenger.instance.Listen("restart_game", this);
}

function GetXValues () {
	startX = endStepParent.GetComponent(EndStepParent).GetStartX();
	endX = endStepParent.GetComponent(EndStepParent).GetEndX();
	disX = endStepParent.GetComponent(EndStepParent).GetDisX();
}

function GetYValues () {
	while (endTrampolines.transform.position.y == 0) {
		yield;
	}
	startY = endTrampolines.transform.position.y;
	endY = endTrampolines.GetComponent(EndTrampolines).GetEndY();
	disY = endY - startY;
}

function CreateTextures () {
	texWhite = CreateTextureFromColor(CustomColor.white);
	texBlack = CreateTextureFromColor(Color.black);
}

function CreateTextureFromColor (col : Color) : Texture2D {
	var t : Texture2D;
	t = new Texture2D(1, 1);
	t.SetPixel(0, 0, col);
	t.wrapMode = TextureWrapMode.Repeat;
	t.Apply();
	return t;
}

function OnGUI () {
	
 	if (!ending)
		return;
		
	GUI.depth = -1;
	
	GUI.color = CustomColor.white;
	if (ending) {
		guiAlpha = playerPosition * 1.5;
	}
	GUI.color.a = guiAlpha;
	
	GUI.DrawTexture(Rect(0, 0, width, height), texBlack, ScaleMode.StretchToFill);
	
	if (ending) {
		
		GUI.color = CustomColor.black;
		GUI.color.a = textAlpha;
		GUI.Label(Rect(center + 2, middle + 2, 0, 0), text[currentText], textStyle);
		
		GUI.color = blinkColor;
		GUI.color.a = textAlpha;
		GUI.Label(Rect(center, middle, 0, 0), text[currentText], textStyle);
	
	}
}

function Blink (speed : float) {
	while (true) {
		blinkColor = CustomColor.green;
		yield WaitForSeconds(speed);
		blinkColor = CustomColor.white;
		yield WaitForSeconds(speed);
		blinkColor = CustomColor.yellow;
		yield WaitForSeconds(speed);
		blinkColor = CustomColor.white;
		yield WaitForSeconds(speed);
		blinkColor = CustomColor.yellow;
		yield WaitForSeconds(speed);
	}
}

function Update () {

	if (!ending)
		return;
		
	//playerPosition = Mathf.Max(((Mathf.Abs(player.position.x - startX)) / disX) - delay, 0.0);
	playerPosition = Mathf.Max(0, (Mathf.Abs(player.position.y - startY) / disY));// - delay);
	SetCurrentText();
	if (playerPosition >= fadeLength) {
		AutoEnd();
	}
	
}

function SetCurrentText () {
	var nextText : int = Mathf.Lerp(0, text.Length - 1, playerPosition / fadeLength);
	
	if (nextText <= previousText)
		return;
	
	previousText = nextText;
	if (currentText != nextText && !fading) {
		StartCoroutine(FadeText(nextText));
	}
}

function FadeText (nextText : int) {
	
	fading = true;
	var eTime : float = 0.0;
	var time : float = 0.25;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		textAlpha = Mathf.Lerp(1.0, 0.0, eTime / time);
		yield;
	}
	
	currentText = nextText;
	
	eTime = 0.0;
	while (eTime < time) {
		eTime += Time.deltaTime;
		textAlpha = Mathf.Lerp(0.0, 1.0, eTime / time);
		yield;
	}
	fading = false;
}

function AutoEnd () {
	endTrampolines.GetComponent(EndTrampolines).EndGame (player.position.z);
	player.gameObject.GetComponent(Player).ResetPosition();
	MainCamera.instance.ResetPosition();
	ending = false;
	StartScreen.instance.ShowStartScreen();
	StartCoroutine(FadeOut());
}

function FadeOut () {
	var eTime : float = 0.0;
	var time : float = 2.5;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		guiAlpha = Mathf.Lerp(1.0, 0.0, eTime / time);
		yield;
	}
}

function _EnterEnd () {
	ending = true;
	StartCoroutine("Blink", 0.05);
}

function _ExitEnd () {
	ending = false;
	previousText = -1;
	StopCoroutine("Blink");
}

function _RestartGame () {
	_ExitEnd ();
}
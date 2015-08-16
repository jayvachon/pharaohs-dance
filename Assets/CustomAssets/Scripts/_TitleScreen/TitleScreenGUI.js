#pragma strict

var demo : boolean = false;

var style : GUIStyle;
var style2 : GUIStyle;

private var left : int;
private var right : int;
private var middle : int;
private var center : int;

private var showText : boolean = false;
private var endText : boolean = false;
private var textColor : Color = Color.white;

private var label1 : String = "Silent";
private var label2 : String = "Demo";

function Start () {
	left = Screen.width * 0.125;
	right = Screen.width * 0.875;
	middle = Screen.height * 0.5;
	center = Screen.width * 0.5;
	Invoke("ShowText", 3);
	InvokeRepeating("Blink", 0, 0.05);
}

function ShowText () {
	showText = true;
}

function ShowEndText () {
	endText = true;
	Application.LoadLevel(2);
}

function Update () {
	if (!showText)
		return;
	if (Input.anyKeyDown) {
	//if (Input.GetButtonDown("Jump") || Input.GetKeyDown (KeyCode.Return)) {
		if (Input.GetKeyDown (KeyCode.A)) {
			Application.OpenURL ("http://astroassembly.com/pharaohs-dance/#download");
			return;
		}
		showText = false;
		Invoke("ShowEndText", 3);
		CancelInvoke("Blink");
		GUI.color = Color.white;
		style.fontSize = 80;
	}
	
	if (!demo) return;
	if (Input.GetKeyDown (KeyCode.A)) {
		//Application.OpenURL ("http://astroassembly.com/pharaohs-dance/#download");
	}
}

function OnGUI () {
	if (endText) 
		GUI.Label(Rect(center, middle, 0, 0), "it's loading now ok\n(this will take a minute)", style);
	if (!showText)
		return;
	GUI.color = Color.white;
	if (demo)
		GUI.Label(Rect(	center, 
						middle + (middle / 1.5), 
						0, 0), "Press 'A' to view the preorder site!", style2);
					
	GUI.color = textColor;
	//GUI.Label(Rect(left, middle, 0, 0), label1, style);
	//GUI.Label(Rect(right, middle, 0, 0), label2, style);
}

function Blink () {
	if (textColor == Color.white)
		textColor = Color.black;
	else
		textColor = Color.white;
	style.fontSize = Random.Range(40, 120);
	var rand : int = Random.Range(0, 10);
	if (rand == 1) {
		label1 = "It's";
		label2 = "Good";
	} else if (rand == 2) {
		label1 = "You";
		label2 = "Like";
	} else {
		label1 = "DEMO";
		label2 = "Demo";
	}
}

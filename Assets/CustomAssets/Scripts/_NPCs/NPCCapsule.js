#pragma strict

public var color : String;
public var ccolor : Color;
public var messages : String[];
public var npcMessage : GameObject;
private var npcMessageScript : NPCMessage;
private var prevMessage : int;

function Start () {
	var c : Color;
	switch (color) {
		case "Blue"  : c = CustomColor.blue;   break;
		case "Red"   : c = CustomColor.red;    break;
		case "Yellow": c = CustomColor.yellow; break;
		case "Violet": c = CustomColor.violet; break;
		case "White" : c = CustomColor.white;  break;
		case "Orange": c = CustomColor.orange; break;
		case "Black" : c = CustomColor.black;  break;
	}
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(c);
	ccolor = c;
	
	npcMessageScript = npcMessage.GetComponent (NPCMessage);
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Net") {
		var message = messages [GetRandomMessage ()];
		npcMessageScript.SetMessage (message, ccolor);
	}
}

function OnTriggerExit (other : Collider) {
	if (other.tag == "Net") {
		npcMessageScript.CloseMessage ();
	}
}

function GetRandomMessage () : int {
	if (messages.Length < 2) { return 0; }
	var currentMessage : int = Random.Range (0, messages.Length);
	while (currentMessage == prevMessage) {
		currentMessage = Random.Range (0, messages.Length);
	}
	prevMessage = currentMessage;
	return currentMessage;
}
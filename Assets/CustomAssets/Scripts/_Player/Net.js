#pragma strict

// The net checks for objects that are close to the player, so that if those objects are collectible they will move to the player

private var player : Transform;
private var startScale : float;
private var myTransform : Transform;

function Awake () {
	myTransform = transform;
	startScale = myTransform.localScale.x;
}

function Start () {
	Messenger.instance.Listen("update_inventory", this);
	Messenger.instance.Listen("restart_game", this);
}

function Update () {
	myTransform.position = myTransform.parent.position;
}

function SetNewScale (s : float) {
	myTransform.localScale.x = s;
	myTransform.localScale.z = s;
}

function _UpdateInventory () {
	/*yield WaitForEndOfFrame();
	var mag : int = Inventory.instance.GetItemValue(Item.magnet);
	if (mag > 0) {
		SetNewScale(startScale + (mag / 1.1));
		//myTransform.localScale.x = startScale + (mag / 1.125); 
		//myTransform.localScale.z = startScale + (mag / 1.125); 
	}*/
}

function _RestartGame () {
	SetNewScale(startScale);
}


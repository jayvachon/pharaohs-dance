#pragma strict

var player : GameObject;
private var radius : float;
private var startScale : float;
private var myTransform : Transform;

private var minSize : float = 0.5;
private var maxSize : float = 3.0;

private var minY : float = 2.0;
private var maxY : float = 5.0;

function Awake () {
	myTransform = transform;
}

function Start () {

	Messenger.instance.Listen("upgrade_parachute", this);
	Messenger.instance.Listen("deploy_parachute", this);
	Messenger.instance.Listen("retract_parachute", this);
	Messenger.instance.Listen("update_inventory", this);
	
	//startScale = myTransform.localScale.x;
	//renderer.material.color = CustomColor.yellow;
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.yellow);
	
	//SetRadius();
	renderer.enabled = false;
	
	animation["ParachuteSpin"].layer = 2;
}

function _DeployParachute() {
	renderer.enabled = true;
	animation.Play("ParachuteSpin");
}

function _RetractParachute() {
	yield WaitForSeconds(animation["ParachuteShrink"].clip.length);
	animation.Stop("ParachuteSpin");
	renderer.enabled = false;
}

function _UpdateInventory () {
	var percent : float = (Inventory.instance.GetItemValue(Item.parachute) + 0.0) / 5.0;
	var newScale : float = ((maxSize - minSize) * percent) + minSize;
	myTransform.localScale = Vector3(newScale, newScale, newScale);
	myTransform.localPosition.y = ((maxY - minY) * percent) + minY;
}
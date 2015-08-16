#pragma strict

function Start () {
	var c : Color[] = [ CustomColor.black, CustomColor.yellow ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	
	Messenger.instance.Listen("close_startscreen", this);
	Messenger.instance.Listen("open_startscreen", this);
}

function _CloseStartscreen () {
	renderer.enabled = false;
}

function _OpenStartscreen () {
	renderer.enabled = true;
}

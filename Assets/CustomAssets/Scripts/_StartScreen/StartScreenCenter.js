#pragma strict

function Start () {
	/*renderer.materials[0].color = CustomColor.black;
	renderer.materials[1].color = CustomColor.yellow;
	renderer.materials[2].color = CustomColor.white;*/
	
	var c : Color[] = [ CustomColor.black, CustomColor.yellow, CustomColor.white ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	
	Messenger.instance.Listen("close_startscreen", this);
	Messenger.instance.Listen("open_startscreen", this);
}

function _CloseStartscreen () {
	renderer.enabled = false;
	//this.gameObject.active = false;
}

function _OpenStartscreen () {
	renderer.enabled = true;
}
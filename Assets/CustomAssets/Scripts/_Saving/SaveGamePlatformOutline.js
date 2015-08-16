#pragma strict

public var webVersion : boolean = false;

function Awake () {
	if (webVersion) {
		gameObject.SetActive (false);
	}
}

function Start () {
	var c : Color[] = [ CustomColor.black, CustomColor.black, CustomColor.dkgrey ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
}

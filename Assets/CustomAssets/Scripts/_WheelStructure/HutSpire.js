#pragma strict

function Start () {
	var c : Color[] = [ CustomColor.dkgrey, CustomColor.white ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
}

#pragma strict

function Start () {
	var c : Color[] = [ CustomColor.black, CustomColor.white ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
}

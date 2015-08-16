#pragma strict

function Start () {
	//renderer.materials[0].color = CustomColor.dkgrey;
	//renderer.materials[1].color = CustomColor.ltgrey;
	var c : Color[] = [ CustomColor.dkgrey, CustomColor.ltgrey ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
}

#pragma strict

function Start () {
	//renderer.materials[0].color = CustomColor.black;
	//renderer.materials[1].color = CustomColor.white;
	var c : Color[] = [ CustomColor.black, CustomColor.white ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
}

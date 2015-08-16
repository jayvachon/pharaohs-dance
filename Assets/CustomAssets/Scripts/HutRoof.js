#pragma strict

function Start () {
	//renderer.materials[0].color = CustomColor.red;
	//renderer.materials[1].color = CustomColor.white;
	var c : Color[] = [ CustomColor.red, CustomColor.white ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
}

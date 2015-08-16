#pragma strict

function Start () {
	/*renderer.materials[0].color = CustomColor.black;
	renderer.materials[1].color = CustomColor.yellow;
	renderer.materials[2].color = CustomColor.black;*/
	var c : Color[] = [ CustomColor.black, CustomColor.yellow, CustomColor.black ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
}
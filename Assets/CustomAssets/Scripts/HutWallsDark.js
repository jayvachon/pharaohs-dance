#pragma strict

function Start () {
	//renderer.materials[0].color = CustomColor.ltgrey;
	renderer.sharedMaterials[0] = MaterialsManager.instance.MaterialColor(CustomColor.ltgrey);
}

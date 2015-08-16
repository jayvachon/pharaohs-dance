#pragma strict

function Start () {
	//renderer.materials[0].color = CustomColor.dkgrey;
	renderer.sharedMaterials[0] = MaterialsManager.instance.MaterialColor(CustomColor.dkgrey);
}

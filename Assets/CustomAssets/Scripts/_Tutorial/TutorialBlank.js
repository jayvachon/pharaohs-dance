#pragma strict

function Start () {
	//renderer.material.color = CustomColor.white;
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.white);
}

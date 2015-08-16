#pragma strict

var stomachFull : boolean = false;

function Start () {
	transform.localScale.x = 1.75;
	transform.localScale.z = 1.75;
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.green);
	if (stomachFull) {
		renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.red + CustomColor.dkgrey);
		transform.localScale.x = 2.25;
		transform.localScale.z = 2.25;
	}
}

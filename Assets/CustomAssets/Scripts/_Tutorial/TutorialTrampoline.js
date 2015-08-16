#pragma strict

function Start () {
	//renderer.material.color = CustomColor.green + CustomColor.black;
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.green + CustomColor.black);
	//Invoke ("Bounce", Random.Range(0.5))
}

function Bounce () {

}
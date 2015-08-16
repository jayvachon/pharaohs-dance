#pragma strict

function Start () {
	renderer.materials[0].color = CustomColor.white;
	renderer.materials[1].color = CustomColor.dkgrey;
}

function Update () {
	//transform.Rotate(Vector3.left * 5.0 * Time.deltaTime * TimeController.timeScale);
}


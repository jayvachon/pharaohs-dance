#pragma strict

function Start () {
	renderer.materials[0].color = CustomColor.black;
	renderer.materials[1].color = CustomColor.violet;
	renderer.materials[2].color = CustomColor.white;
	animation.Play();
}

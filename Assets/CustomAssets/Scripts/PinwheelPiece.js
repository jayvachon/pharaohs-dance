#pragma strict

function Start () {
	renderer.materials[0].color = CustomColor.black;
	renderer.materials[1].color = CustomColor.black;
	//renderer.sharedMaterials[0] = MaterialsManager.instance.MaterialColor(CustomColor.black);
	//renderer.sharedMaterials[1] = MaterialsManager.instance.MaterialColor(CustomColor.black);	
}


/*function Animate (interrupt : boolean) {
	if (!interrupt) {
		if (animation.IsPlaying()) {
			return;
		}
	}
	animation.Play();
}*/
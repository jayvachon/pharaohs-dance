#pragma strict

private var controller : CharacterController;
private var widened : boolean = false;

function Start () {
	var c : Color[] = [ CustomColor.black, CustomColor.white ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	
	var player : GameObject = GameObject.FindGameObjectWithTag("Player");
	controller = player.GetComponent(CharacterController);
	InvokeRepeating("Widen", 0.0, 0.5);
}

function Widen () {
	if (controller.velocity.y < -10.0) {
		if (!widened) {
			animation["EyesWiden"].speed = 1.0;
			animation.Play("EyesWiden");
			widened = true;
		}
	} else {
		if (widened) {
			animation["EyesWiden"].speed = -1.0;
			animation.Play("EyesWiden");
			widened = false;
		}
	}
}
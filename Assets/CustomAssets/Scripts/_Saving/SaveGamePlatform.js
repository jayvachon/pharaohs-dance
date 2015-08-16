#pragma strict

function Start () {
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.yellow);
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Net") {
		new MessageSaveGame ();
	}
}

#pragma strict

var color : int;

function Start () {
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.colorProgression[color]);
}
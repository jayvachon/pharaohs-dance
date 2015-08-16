#pragma strict

function SetColor (index : int) {
	var c : Color = CustomColor.colorProgression [index];
	c.a = 0.75;
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor (c);
}
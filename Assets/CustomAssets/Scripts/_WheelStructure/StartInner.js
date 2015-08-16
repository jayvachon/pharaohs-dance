#pragma strict

private var center : Transform;

function Start () {
	renderer.materials[0].color = CustomColor.black;
	renderer.materials[1].color = CustomColor.black;
	
	center = transform.parent.GetComponent(StartOutline).center;
	
	/*renderer.materials[0].shader = Shader.Find("Transparent/Diffuse");
	renderer.materials[0].color = CustomColor.colorProgression[Wheel.instance.FindCenterInArray(center)];
	renderer.materials[0].color.a = 0.5;*/
}

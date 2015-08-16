#pragma strict

private var color : Color[] = new Color[3];

function Start () {

	color[0] = CustomColor.black;
	color[1] = CustomColor.black;
	color[2] = CustomColor.dkgrey;
	
	for (var i = 0; i < 3; i ++) {
		//color[i].a = 0.5;
		//renderer.materials[i].color = color[i];
	}
	
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(color);
	
}

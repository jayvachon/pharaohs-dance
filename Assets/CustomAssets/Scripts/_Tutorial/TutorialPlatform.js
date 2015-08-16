#pragma strict

var red : boolean = true;

function Start () {
	//renderer.materials[0].color = CustomColor.black;
	
	var c1 : Color = CustomColor.red;
	var c2 : Color = CustomColor.red;
	
	if (!red) {
		c1 = CustomColor.violet;
		c2 = CustomColor.violet + CustomColor.dkgrey;
	}
	
	/*if (red) {
		renderer.materials[1].color = CustomColor.red;
		renderer.materials[2].color = CustomColor.red;
	} else {
		renderer.materials[1].color = CustomColor.violet;
		renderer.materials[2].color = CustomColor.violet + CustomColor.dkgrey;
	}*/
	
	var c : Color[] = [ CustomColor.black, c1, c2 ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	
}

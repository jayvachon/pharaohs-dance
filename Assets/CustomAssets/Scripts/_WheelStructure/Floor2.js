#pragma strict

function Start () {
	var c : Color[] = [ CustomColor.black, 
						CustomColor.red + CustomColor.dkgrey, 
						CustomColor.red ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
}
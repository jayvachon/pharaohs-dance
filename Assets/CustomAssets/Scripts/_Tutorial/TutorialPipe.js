#pragma strict

function Start () {
	
	var yellow : Color = CustomColor.yellow;
	yellow.a = 0.85;
	/*renderer.materials[0].color = yellow;
	renderer.materials[1].color = yellow;
	renderer.materials[2].color = yellow;*/
	
	var c : Color[] = [ CustomColor.black, yellow, yellow ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	
}

function Update () {	
	transform.Rotate(Vector3(0, 25, 0) * Time.deltaTime);
}
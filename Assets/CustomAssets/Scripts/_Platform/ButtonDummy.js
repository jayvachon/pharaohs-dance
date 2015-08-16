#pragma strict

private var myTransform : Transform;

function Awake () {
	myTransform = transform;
}

function Start () {
	var c : Color[] = [ CustomColor.black, CustomColor.white ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
}

function Init (p : Platform) {
	myTransform.localScale.y = p.buttonScale * 0.63;
}

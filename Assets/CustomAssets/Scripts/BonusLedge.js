#pragma strict

var crystal : GameObject;
private var myCrystal : GameObject;

function Start () {

	var c : Color[] = [ CustomColor.black, CustomColor.red ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	
	CreateCrystal ();
	
	Messenger.instance.Listen("restart_game", this);
	
}

function CreateCrystal () {
	yield WaitForFixedUpdate ();
	var pos : Vector3 = transform.position;
	pos.y += 10;
	myCrystal = ObjectBase.instance.Instantiate(crystal, pos);
	var cr : Crystal = myCrystal.GetComponent(Crystal);
	cr.SetBonus (true);
}

function _RestartGame () {
	CreateCrystal ();
}
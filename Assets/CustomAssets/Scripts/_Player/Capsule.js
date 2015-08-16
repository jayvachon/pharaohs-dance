#pragma strict

var capsuleTrail : GameObject;

private var input : FPSInputController;
private var myTransform : Transform;
private var startScale : float = 0.45;
private var fullScale : float = 0.67;
private var interval : float = 0.0;

private var startColor : Color;
private var fullColor : Color;
private var timeScale : float = 1.0;
private var currentColor : Color;

//private var invoking : boolean = false;

function Awake () {
	myTransform = transform;
	input = myTransform.parent.GetComponent(FPSInputController);
}

function Start () {
	startColor = CustomColor.green;
	fullColor = CustomColor.red + CustomColor.dkgrey;
	currentColor = startColor;
	renderer.sharedMaterial.color = currentColor;
	
	Messenger.instance.Listen("add_crystal", this);
	Messenger.instance.Listen("update_inventory", this);
	Messenger.instance.Listen("empty_stomach", this);
	Messenger.instance.Listen("restart_game", this);
	Messenger.instance.Listen("change_time", this);
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("collect_airbonus", this);
	Messenger.instance.Listen("collect_coin", this);
	Messenger.instance.Listen("collect_pill1", this);
	Messenger.instance.Listen("collect_pill2", this);
	Messenger.instance.Listen("collect_pill3", this);
	Messenger.instance.Listen("collect_pill4", this);
	Messenger.instance.Listen("collect_pill5", this);
	Messenger.instance.Listen("collect_pill6", this);
	Messenger.instance.Listen("collect_pill7", this);
	Messenger.instance.Listen("collect_crystal0", this);
	Messenger.instance.Listen("collect_crystal1", this);
	Messenger.instance.Listen("collect_crystal2", this);
	Messenger.instance.Listen("collect_crystal3", this);
	Messenger.instance.Listen("collect_crystal4", this);
	Messenger.instance.Listen("collect_crystal5", this);
	Messenger.instance.Listen("collect_crystal6", this);
	Messenger.instance.Listen("collect_crystal7", this);
	Messenger.instance.Listen("collect_reverser", this);
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
	
	SetInterval(Inventory.instance.GetItemValue(Item.stomach));
	
}

function Update () {
	if (input.moveDirection != Vector3.zero) {
		myTransform.localRotation = Quaternion.Lerp(myTransform.localRotation, Quaternion.LookRotation(input.moveDirection), Time.deltaTime * 10.0);
	}
}

function CreateCapsuleTrail () {
	if (!input.stop) {
		var ct : GameObject = CapsuleTrailPool.instance.Instantiate(myTransform.position);
		ct.renderer.material.color = renderer.sharedMaterial.color;
		ct.renderer.material.color.a = 0.0;
		ct.transform.localRotation = myTransform.rotation;
		
		var myScale : Vector3 = myTransform.localScale;
		var parScale : Vector3 = myTransform.parent.localScale;
		var newScale : Vector3 = Vector3(myScale.x * parScale.x, myScale.y * parScale.y, myScale.z * parScale.z);
		ct.transform.localScale = newScale;
	}
}

function ResetScale () {
	myTransform.localScale.x = startScale;
	myTransform.localScale.z = startScale;
}

function AddScale (scale : float) {
	myTransform.localScale.x += scale;
	myTransform.localScale.z += scale;
}

function GetScale () {
	return myTransform.localScale.x;
}

function SetInterval (size : int) {
	interval = (fullScale - startScale) / (size + 0.0);
}

function SetColor () {
	if (GetScale() >= fullScale) {
		if (currentColor == startColor) {
			FadeColor(startColor, fullColor, 0.5);
		}
	} else {
		if (currentColor == fullColor) {
			FadeColor(fullColor, startColor, 0.5);
		}
	}
}

function FadeColor (col1 : Color, col2 : Color, time : float) {
	var elapsedTime : float = 0.0;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		renderer.sharedMaterial.color = Color.Lerp(col1, col2, elapsedTime / time);
		yield;
	}
	currentColor = col2;
}

function PulseColor (col1 : Color, col2 : Color) {
	var time : float = 0.25;
	var elapsedTime : float = 0.0;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		renderer.sharedMaterial.color = Color.Lerp(col1, col2, elapsedTime / time);
		yield;
	}
	
	elapsedTime = 0.0;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime * 2.0;
		renderer.sharedMaterial.color = Color.Lerp(col2, col1, elapsedTime / time);
		yield;
	}
	
	renderer.sharedMaterial.color = col1;
}

function PulseColor (col1 : Color, col2 : Color, time : float) {
	var elapsedTime : float = 0.0;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		renderer.sharedMaterial.color = Color.Lerp(col1, col2, elapsedTime / time);
		yield;
	}
	
	elapsedTime = 0.0;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime * 2.0;
		renderer.sharedMaterial.color = Color.Lerp(col2, col1, elapsedTime / time);
		yield;
	}
	
	renderer.sharedMaterial.color = col1;
}

function GetColor () {
	return currentColor;
}

function _UpdateInventory () {
	yield WaitForFixedUpdate();
	SetInterval(Inventory.instance.GetItemValue(Item.stomach));
}

function _AddCrystal () {
	if (!Inventory.instance.IsStomachFull()) {
		AddScale(interval);
	} else {
		if (GetColor() != fullColor) {
			FadeColor(startColor, fullColor, 0.5);
		}
	}
}

function _EmptyStomach() {
	ResetScale();
	SetColor();
}

function _RestartGame() {
	yield WaitForFixedUpdate ();
	ResetScale();
	yield WaitForSeconds(1);
	currentColor = startColor;
	renderer.sharedMaterial.color = currentColor;
}

function _LerpTime () {
	var ts : float = Mathf.Max(0.01, TimeController.instance.GetCurrentScale());
	if (ts <= 0.75) {
		if (timeScale != ts) {
			CancelInvoke("CreateCapsuleTrail");
			InvokeRepeating("CreateCapsuleTrail", 0.0, (0.125 / ts));
			timeScale = ts;
		}
	} else {
		CancelInvoke("CreateCapsuleTrail");
		timeScale = 1.0;
	}
}

function _CollectCoin () {
	PulseColor(GetColor(), CustomColor.yellow, 0.125);
}

function _CollectReverser () {
	PulseColor(GetColor(), CustomColor.blue, 0.125);
}

function _CollectAirbonus () {
	PulseColor(GetColor(), CustomColor.red);
}

function _CollectPill1 () {
	PulseColor(GetColor(), CustomColor.colorProgression[1]);
}

function _CollectPill2 () {
	PulseColor(GetColor(), CustomColor.colorProgression[2]);
}

function _CollectPill3 () {
	PulseColor(GetColor(), CustomColor.colorProgression[3]);
}

function _CollectPill4 () {
	PulseColor(GetColor(), CustomColor.colorProgression[4]);
}

function _CollectPill5 () {
	PulseColor(GetColor(), CustomColor.colorProgression[5]);
}

function _CollectPill6 () {
	PulseColor(GetColor(), CustomColor.colorProgression[6]);
}

function _CollectPill7 () {
	PulseColor(GetColor(), CustomColor.colorProgression[7]);
}


// Crystals
function _CollectCrystal0 () {
	PulseColor(GetColor(), CustomColor.colorProgression[0]);
}

function _CollectCrystal1 () {
	PulseColor(GetColor(), CustomColor.colorProgression[1]);
}

function _CollectCrystal2 () {
	PulseColor(GetColor(), CustomColor.colorProgression[2]);
}

function _CollectCrystal3 () {
	PulseColor(GetColor(), CustomColor.colorProgression[3]);
}

function _CollectCrystal4 () {
	PulseColor(GetColor(), CustomColor.colorProgression[4]);
}

function _CollectCrystal5 () {
	PulseColor(GetColor(), CustomColor.colorProgression[5]);
}

function _CollectCrystal6 () {
	PulseColor(GetColor(), CustomColor.colorProgression[6]);
}

function _CollectCrystal7 () {
	PulseColor(GetColor(), CustomColor.colorProgression[7]);
}

function _SaveGame () {
	PulseColor (GetColor (), CustomColor.yellow);
	SaveGameManager.SaveBool  ("capsule_color", currentColor == startColor);
	SaveGameManager.SaveFloat ("capsule_scale", GetScale ());
}

function _LoadGame () {
	var c : boolean = SaveGameManager.LoadBool ("capsule_color");
	if (c) {
		currentColor = startColor;
	} else {
		currentColor = fullColor;
	}
	renderer.sharedMaterial.color = currentColor;
	
	var scale : float = SaveGameManager.LoadFloat ("capsule_scale");
	myTransform.localScale.x = scale;
	myTransform.localScale.z = scale;
}
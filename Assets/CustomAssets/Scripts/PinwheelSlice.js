#pragma strict

private var myTransform : Transform;
private var degrees : float = 0.0;
private var color : boolean = false;
private var color1 : Color;
private var color2 : Color;
private var revolutions : int;

function Awake () {
	myTransform = transform;
	renderer.enabled = false;
	InvokeRepeating("Spin", 0.0, 0.1);
	Spin();
}

function Start () {
	Messenger.instance.Listen("bottomed_button", this);
	Messenger.instance.Listen("collect_pill1", this);
	Messenger.instance.Listen("collect_pill2", this);
	Messenger.instance.Listen("collect_pill3", this);
	Messenger.instance.Listen("collect_pill4", this);
	Messenger.instance.Listen("collect_pill5", this);
	Messenger.instance.Listen("collect_pill6", this);
	Messenger.instance.Listen("collect_crystal1", this);
	Messenger.instance.Listen("collect_crystal2", this);
	Messenger.instance.Listen("collect_crystal3", this);
	Messenger.instance.Listen("collect_crystal4", this);
	Messenger.instance.Listen("collect_crystal5", this);
	Messenger.instance.Listen("collect_crystal6", this);
	Messenger.instance.Listen("create_pipe", this);
}

function Spin () {
	color = !color;
	if (color) {
		//renderer.materials[0].color = color1;
		//renderer.materials[1].color = color1;
		var c : Color[] = [ color1, color1 ];
		renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	} else {
		//renderer.materials[0].color = color2;
		//renderer.materials[1].color = color2;
		c = [ color2, color2 ];
		renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	}
	myTransform.Rotate(Vector3.right * 15);
	degrees += 15.0 * Wheel.direction;
	if (Mathf.Abs(degrees) >= revolutions * 360) {
		renderer.enabled = false;
	}
}

function StartSpin (col1 : Color, col2 : Color, rev : int) {
	degrees = 0;
	color1 = col1;
	color2 = col2;
	revolutions = rev;
	renderer.enabled = true;
}

function PillSpin (i : int) {
	var c : Color = CustomColor.colorProgression[i] + CustomColor.black;
	//var c2 = CustomColor.colorProgression[i] * CustomColor.black;
	var c2 = CustomColor.colorProgression[i] + CustomColor.white;
	StartSpin(c, c2, 2);
}

function _BottomedButton () {
	StartSpin(CustomColor.white, CustomColor.white, 1);
}

function _CollectPill1 () {
	PillSpin(1);
}

function _CollectPill2 () {
	PillSpin(2);
}

function _CollectPill3 () {
	PillSpin(3);
}

function _CollectPill4 () {
	PillSpin(4);
}

function _CollectPill5 () {
	PillSpin(5);
}

function _CollectPill6 () {
	PillSpin(6);
}

function _CollectCrystal1 () {
	PillSpin(1);
}

function _CollectCrystal2 () {
	PillSpin(2);
}

function _CollectCrystal3 () {
	PillSpin(3);
}

function _CollectCrystal4 () {
	PillSpin(4);
}

function _CollectCrystal5 () {
	PillSpin(5);
}

function _CollectCrystal6 () {
	PillSpin(6);
}

function _CreatePipe () {
	//var c : Color = CustomColor.yellow + CustomColor.black;
	//var c2 = CustomColor.yellow * CustomColor.black;
	StartSpin(CustomColor.yellow, CustomColor.yellow, 1.5);
}

function _LerpTime () {
	InvokeRepeating("Spin", 0.0, 0.1 * TimeController.timeScale);
}
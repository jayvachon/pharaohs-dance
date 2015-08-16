#pragma strict

public var body : Transform;
public var center : Transform;

private var rotateSpeed : int = 160;
private var timeScale : float = 1.0;
private var myTransform : Transform;

private var lastColor : int = 0;

function Awake () {
	myTransform = transform;
}

function Start () {
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("save_game", this);
	var c : Color[] = [ CustomColor.black, CustomColor.white, CustomColor.grey, CustomColor.grey ];
	body.renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	center.renderer.sharedMaterial = MaterialsManager.instance.MaterialColor (c[2]);
}

function Update () {
	myTransform.Rotate(Vector3.up * rotateSpeed * Time.deltaTime * timeScale);
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

function _SaveGame () {
	var c : Color[] = [ RandomColor (), CustomColor.white, CustomColor.grey, CustomColor.grey ];
	body.renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
}

function RandomColor () : Color {
	var i : int = Random.Range (0, 7);
	while (i == lastColor) {
		i = Random.Range (0, 7);
	}
	lastColor = i;
	switch (i) {
		case 0: return CustomColor.black;
		case 1: return CustomColor.white;
		case 2: return CustomColor.red;
		case 3: return CustomColor.violet;
		case 4: return CustomColor.blue;
		case 5: return CustomColor.green;
		case 6: return CustomColor.yellow;
		case 7: return CustomColor.orange;
	}
}
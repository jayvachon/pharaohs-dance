#pragma strict

private var rotateSpeed : int = 160;
private var timeScale : float = 1.0;
private var myTransform : Transform;

function Awake () {
	myTransform = transform;
}

function Start () {
	Messenger.instance.Listen("lerp_time", this);
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.colorProgression[1]);
}

function Update () {
	//myTransform.Rotate(Vector3.forward * rotateSpeed * Time.deltaTime * timeScale);
	myTransform.Rotate(Vector3.up * rotateSpeed * Time.deltaTime * timeScale);
	//myTransform.Rotate(Vector3.down * rotateSpeed * Time.deltaTime * timeScale);
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}
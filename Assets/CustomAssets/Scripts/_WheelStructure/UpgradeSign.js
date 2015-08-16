#pragma strict

private var rotateSpeed : int = 160;
private var timeScale : float = 1.0;
private var myTransform : Transform;

function Awake () {
	myTransform = transform;
}

function Start () {
	Messenger.instance.Listen("lerp_time", this);
	var c : Color[] = [ CustomColor.green, CustomColor.black ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
}

function Update () {
	myTransform.Rotate(Vector3.down * rotateSpeed * Time.deltaTime * timeScale);
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}
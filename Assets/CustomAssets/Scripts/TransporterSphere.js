#pragma strict

private var myTransform : Transform;

function Awake () {
	myTransform = transform;
	//animation.Play("TransporterGrow");
}

function OnEnable () {
	animation.Play("TransporterGrow");
}

function Update () {
	myTransform.Rotate(Vector3.up * 60.0 * Time.deltaTime * TimeController.timeScale);
}
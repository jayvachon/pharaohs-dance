#pragma strict

private var rotateSpeed : int;
@HideInInspector
var timeScale : float = 1.0;

function Start () {
	rotateSpeed = Random.Range(80, 120);
}

function Update () {
	transform.Rotate(Vector3.forward * rotateSpeed * Time.deltaTime * timeScale);
	transform.Rotate(Vector3.up * rotateSpeed * Time.deltaTime * timeScale);
}
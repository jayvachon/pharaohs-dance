#pragma strict

private var myTransform : Transform;

function Awake () {
	myTransform = transform;
}

/*function FixedUpdate () {
	//myTransform.Rotate(Vector3.right * 16.0 * Time.deltaTime);
	myTransform.RotateAround(Vector3.zero, Vector3.right, 16.0 * Time.deltaTime);
}*/
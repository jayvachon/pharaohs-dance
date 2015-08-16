#pragma strict

private var myTransform : Transform;
private var angle : float = 0;

function Awake () {
	myTransform = transform;
}

/*function FixedUpdate () {
	//angle += 16.0 * Time.deltaTime;
	//myTransform.position.z = 25 * Mathf.Sin(angle * Mathf.Deg2Rad);
	//myTransform.RotateAround(Vector3.zero, myTransform.parent.eulerAngles.normalized.forward, 16.0 * Time.deltaTime);
	
	//myTransform.Rotate(Vector3.forward * 16.0 * Time.deltaTime);
}*/
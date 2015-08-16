#pragma strict

private var myTransform : Transform;
private var player : Transform;

function Awake () {
	myTransform = transform;
}

function Start () {
	renderer.material.color = CustomColor.green;
	renderer.material.color.a = 0.25;
	
	player = GameObject.FindGameObjectWithTag("Player").transform;
}

function Update () {
	myTransform.rotation = Quaternion.LookRotation(Vector3.right, myTransform.position - player.position);
}
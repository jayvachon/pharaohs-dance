#pragma strict

private var player : Transform;
private var myTransform : Transform;

function Awake () {
	myTransform = transform;
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
}

function Update () {
	myTransform.position = player.position;
}
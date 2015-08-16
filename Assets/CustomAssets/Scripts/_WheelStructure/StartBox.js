#pragma strict

private var myTransform : Transform;

function Awake () {
	myTransform = transform;
}

function OnTriggerStay (other : Collider) {
	myTransform.parent.GetComponent(StartOutline).BoxCollided(myTransform.tag);
}
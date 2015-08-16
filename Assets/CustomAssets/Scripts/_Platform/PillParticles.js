#pragma strict

function OnEnable () {
	Invoke("Destroy", 1.25);
}

function Destroy () {
	ObjectBase.instance.Destroy(this.gameObject);
}
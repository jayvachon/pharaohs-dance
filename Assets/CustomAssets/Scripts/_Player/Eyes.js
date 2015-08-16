#pragma strict

function Start () {
	//Invoke ("Blink", 3.0);
}

function Blink () {
	animation.Play ("EyesBlink");
	var randomTime : float = Random.Range (3.0, 9.0);
	Invoke ("Blink", randomTime);
}

function OnEnable () {
	CancelInvoke("Blink");
	Invoke ("Blink", 3.0);
}
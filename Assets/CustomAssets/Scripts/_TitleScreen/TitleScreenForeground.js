#pragma strict

private var entering : boolean = true;
private var exiting : boolean = false;

function Start () {
	Invoke("EndEnter", animation["ForegroundExpand"].length);
}

function EndEnter () {
	entering = false;
}

function Update () {
	//if (Input.GetButtonDown("Jump") || Input.GetKeyDown (KeyCode.Return)) {
	if (Input.anyKeyDown) {
		if (Input.GetKeyDown (KeyCode.A)) {
			return;
		}
		Exit ();
	}
}

function Exit () {
	if (exiting || entering)
		return;
	animation["ForegroundExpand"].speed = -1;
	animation["ForegroundExpand"].time = animation["ForegroundExpand"].length;
	animation.Play();
	exiting = true;
}
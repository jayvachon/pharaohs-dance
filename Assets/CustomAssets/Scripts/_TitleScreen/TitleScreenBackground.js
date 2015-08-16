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
	transform.Rotate(Vector3.up * 10.0 * Time.deltaTime);
}

function Exit () {
	if (exiting || entering)
		return;
	animation["BackgroundExpand"].speed = -1;
	animation["BackgroundExpand"].time = animation["BackgroundExpand"].length;
	animation.Play();
	exiting = true;
}
#pragma strict
#pragma downcast

private var player : Transform;
private var yPos : float;
private var myTransform : Transform;
private var shrank : boolean = false;
private var trampoline : Trampoline;
private var blank : Blank;
private var child : String;
private var inView : boolean = false;

function Awake () {
	myTransform = transform;
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
	yPos = myTransform.position.y;
	for (var c : Transform in myTransform) {
		if (c.name == "TrampolineRender") {
			child = c.name;
			trampoline = c.GetComponent(Trampoline);
		}
		if (c.name == "Blank") {
			child = c.name;
			blank = c.GetComponent(Blank);
		}
	}
}

function ColorTrampoline (ci : int) {
	trampoline.ColorTrampoline(ci);
}

function Shrink () {
	if (!shrank) {
		animation.Play("TrampolineShrink");
		EnableColliders();
		shrank = true;
	}
}

function Grow () {
	if (shrank) {
		animation.Play("TrampolineGrow");
		yield WaitForSeconds(animation["TrampolineGrow"].length);
		DisableColliders();
		shrank = false;
	}
}

function SetInView (iv : boolean) {
	inView = iv;
}

function GetInView () {
	return inView;
}

function DisableColliders () {
	if (child == "TrampolineRender") {
		trampoline.EnableCollider();
	} else {
		blank.EnableCollider();
	}
}

function EnableColliders () {
	if (child == "TrampolineRender") {
		trampoline.DisableCollider();
	} else {
		blank.DisableCollider();
	}
}
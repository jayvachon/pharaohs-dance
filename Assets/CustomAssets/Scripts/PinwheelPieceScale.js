#pragma strict

private var child : GameObject;

function Start () {
	child = transform.GetChild(0).gameObject;
	child.transform.localScale = Vector3.zero;
}

function Animate (col : Color, interrupt : boolean) {
	child.renderer.materials[0].color = col;
	child.animation["PinwheelPieceExpand"].speed = TimeController.timeScale;
	if (interrupt) {
		if (child.animation.IsPlaying("PinwheelPieceExpand")) {
			child.animation.Stop("PinwheelPieceExpand");
		}
	} else {
		if (child.animation.IsPlaying("PinwheelPieceExpand")) {
			return false;
		}
	}
	child.animation.Play();
	return true;
}

function IsPlaying () {
	return child.animation.IsPlaying("PinwheelPieceExpand");
}
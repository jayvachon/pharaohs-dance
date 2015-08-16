#pragma strict

private var transparent : boolean = false;
private var animationLength : float;

private var player : Transform;
private var yPos : float;

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
	yPos = transform.position.y;
	animationLength = animation["FadeLimit"].length;
	InvokeRepeating("CheckForPlayer", 0.0, 0.33);
}

function CheckForPlayer () {
	if (transparent) {
		FadeIn();
	} else {
		FadeOut();
	}
}

function FadeIn () {
	if (player.position.y > yPos) {
		if (!animation.isPlaying)
			new MessagePlayerRise ();
		animation.Play("FadeLimitIn");
		yield WaitForSeconds(animationLength);
		transparent = false;
	}
}

function FadeOut () {
	if (player.position.y < yPos) {
		if (!animation.isPlaying)
			new MessagePlayerFall ();
		animation.Play("FadeLimit");
		yield WaitForSeconds(animationLength);
		transparent = true;
	}
}

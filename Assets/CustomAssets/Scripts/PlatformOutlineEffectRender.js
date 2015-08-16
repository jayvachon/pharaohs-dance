#pragma strict

var alpha : float = 0.0;
var fadeAlpha : float = 1.0;

function Awake () {
	renderer.material.color.a = 0.0;
}

function Start () {
	Messenger.instance.Listen("restart_game", this);
}

function PlayAnimation (speed : float, time : float, wrapMode : WrapMode) {
	animation["PlatformOutlineEffectFade"].speed = speed;
	animation["PlatformOutlineEffectFade"].time = time;
	animation["PlatformOutlineEffectFade"].wrapMode = wrapMode;
	
	if (wrapMode == WrapMode.Once) {
		fadeAlpha = 1.0;
		animation.Play("PlatformOutlineEffectFade");
	} else {
		yield FadeIn();
		animation.Play("PlatformOutlineEffectFade");
	}

	while (animation.isPlaying) {
		renderer.material.color.a = alpha;
		yield;
	}
	
}

function StopAnimation () {
	animation.Stop();
	FadeOut();
}

function FadeIn () {
	
	var eTime : float = 0.0;
	var time : float = 0.5;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		fadeAlpha = Mathf.Lerp(0.0, 1.0, eTime / time);
		renderer.material.color.a = alpha * fadeAlpha;
		yield;
	}
}

function FadeOut () {
	
	var eTime : float = 0.0;
	var time : float = 0.5;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		fadeAlpha = Mathf.Lerp(1.0, 0.0, eTime / time);
		renderer.material.color.a = alpha * fadeAlpha;
		yield;
	}
}

function _RestartGame () {
	fadeAlpha = 0.0;
	renderer.material.color.a = 0.0;
}
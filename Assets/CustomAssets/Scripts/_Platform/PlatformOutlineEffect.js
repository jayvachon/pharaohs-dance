#pragma strict

private var delay : float = 0.0;
private var child : Transform;
private var childAnimation : Animation;
private var childRenderer : MeshRenderer;

private var direction : int = -1;
private var scale : float = 1.0;

private var timeScale : float = 1.0;

private var time : float = 0.0;

function Awake () {

	child = transform.GetChild(0);
	childAnimation = child.GetComponent(Animation).animation;
	childRenderer = child.GetComponent(MeshRenderer);
	
	/*Messenger.instance.Listen("collect_pill1", this);
	Messenger.instance.Listen("collect_pill2", this);
	Messenger.instance.Listen("collect_pill3", this);
	Messenger.instance.Listen("collect_pill4", this);
	Messenger.instance.Listen("collect_pill5", this);
	Messenger.instance.Listen("collect_pill6", this);
	
	Messenger.instance.Listen("reverse_wheel", this);
	Messenger.instance.Listen("change_time", this);
	Messenger.instance.Listen("restart_game", this);	*/
	
	//SetDelay(direction);
	//StopAnimation();
	
	var c : Color = CustomColor.white;
	c.a = 0.99;
	//child.renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(c);
	child.renderer.material.color = c;
	
	animation["PlatformOutlineEffectGrow"].time = 0.0;
	animation["PlatformOutlineEffectGrow"].wrapMode = WrapMode.Once;
	
}

function OnEnable () {
	Notify ();
}

function SetDelay (direction : int) {
	while (transform.parent == null) {
		yield;
	}
	var parent = transform.parent.GetComponent(Platform);
	var row : float = parent.row + 1.0;
	var columns : float = (row * Wheel.columns) + 0.0;
	var index : float = ((parent.index + 1.0) - columns) * -1.0;
	
	if (direction == 1) {
		index = (parent.index + 1.0);
	}
	
	delay = (index / columns) * (columns / 2.0);
}

function PlayAnimation (speed : float) {
	
	animation["PlatformOutlineEffectGrow"].speed = speed;
	animation["PlatformOutlineEffectGrow"].time = delay;
	animation["PlatformOutlineEffectGrow"].wrapMode = WrapMode.Loop;
	
	animation.Play();
	PlayChildAnimation(speed, delay, WrapMode.Loop);
}

function StopAnimation () {
	
	animation["PlatformOutlineEffectGrow"].wrapMode = WrapMode.Once;
	child.gameObject.GetComponent(PlatformOutlineEffectRender).StopAnimation();
	//childAnimation["PlatformOutlineEffectFade"].wrapMode = WrapMode.Once;
	
	/*while (animation["PlatformOutlineEffectGrow"].time < animation["PlatformOutlineEffectGrow"].length) {
		yield;
	}
	
	animation["PlatformOutlineEffectGrow"].time = 0.0;
	childAnimation["PlatformOutlineEffectFade"].time = 0.0;*/
}

function SetColor(i : int) {
	var a : float = child.renderer.sharedMaterial.color.a;
	var shade : Color;
	var shadeType : int = Random.Range(0, 1);
	switch (shadeType) {
		case 0 : shade = CustomColor.white; break;
		case 1 : shade = CustomColor.ltgrey; break;
		//case 2 : shade = CustomColor.dkgrey; break;
		//case 3 : shade = CustomColor.black; break;
	}
	//child.renderer.material.color = (CustomColor.colorProgression[i] * shade) + CustomColor.dkgrey;
	child.renderer.sharedMaterial = MaterialsManager.instance.MaterialColor((CustomColor.colorProgression[i] * shade) + CustomColor.dkgrey);
	//child.renderer.material.color.a = a;
	
	/*var eTime : float = 0.0;
	var time : float = 0.25;
	var startA : float = child.renderer.material.color.a;
	var tempA : float = 0.0;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		tempA = Mathf.Lerp(0.0, 1.0, eTime / time);
		child.renderer.material.color.a = startA * tempA;
		yield;
	}*/
}

/*function OnActivateRenderer () {
	
}

function _ChangeTime () {
	scale = TimeController.instance.GetCurrentScale();
	if (scale == 1.0) {
		StopAnimation();
		timeScale = scale;
	} else {
		if (timeScale != scale) {
			if (child.renderer.enabled) {
				SetColor(TimeController.instance.GetScalePosition());
				PlayAnimation(scale);	
				timeScale  = scale;
			} else {
				while (!child.renderer.enabled) {
					yield;
				}
				if (TimeController.instance.GetCurrentScale() < 1.0) {
					SetColor(TimeController.instance.GetScalePosition());
					PlayAnimation(scale);	
					timeScale  = scale;
				}
			}
		}
	}
}

function _ReverseWheel () {
	if (animation.isPlaying) {
		StopAnimation();
		direction *= -1;
		SetDelay(direction);
		PlayAnimation(scale);
	} else {
		direction *= -1;
		SetDelay(direction);
	}
}*/

function Notify () {
	
	//if (scale == 1.0) {
		var animSpeed : float = Mathf.Max(0.1, 3 * TimeController.timeScale);
		animation["PlatformOutlineEffectGrow"].speed = animSpeed;
		animation.Play("PlatformOutlineEffectGrow");
		PlayChildAnimation(animSpeed, 0, WrapMode.Once);
		yield WaitForSeconds(animation["PlatformOutlineEffectGrow"].length / animSpeed);
		ObjectBase.instance.Destroy(this.gameObject);
	//}
	
}

function PlayChildAnimation (speed : float, time : float, wrapMode : WrapMode) {
	child.gameObject.GetComponent(PlatformOutlineEffectRender).PlayAnimation(speed, time, wrapMode);
}

/*function _RestartGame () {
	if (animation.isPlaying) {
		StopAnimation();
	}
}*/
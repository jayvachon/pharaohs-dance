#pragma strict

@HideInInspector
var periodPosition : int;					// Which time period this effect is tied to
private var timeScale : float;
private var myTransform : Transform;
private var startScale : float = 0.001;
private var fullScale : float = 1.0;

function Awake () {
	myTransform = transform;
}

function Start () {

	Messenger.instance.Listen("change_time", this);
	
	switch (periodPosition) {
		case 1:
			Messenger.instance.Listen("collect_pill1", this);
			break;
		case 2:
			Messenger.instance.Listen("collect_pill2", this);
			break;
		case 3:
			Messenger.instance.Listen("collect_pill3", this);
			break;
		case 4:
			Messenger.instance.Listen("collect_pill4", this);
			break;
		case 5:
			Messenger.instance.Listen("collect_pill5", this);
			break;
		case 6:
			Messenger.instance.Listen("collect_pill6", this);
			break;
		case 7:
			Messenger.instance.Listen("collect_pill7", this);
			break;
	}
	
	timeScale = TimeController.timeScales[periodPosition];
	if (periodPosition == 0) {
		myTransform.localScale.y = 1.0;
		myTransform.localScale.z = 1.0;
	} else {
		myTransform.localScale.y = startScale;
		myTransform.localScale.z = startScale;
	}
}

function Resize (start : float, end : float) {
	
	renderer.enabled = true;
	var speed : float = 0.5;
	var scale : float = start;
	
	if (end < 1.0)
		speed = 4.0;
	
	while (Mathf.Round(scale * 100) / 100 != end) {
		scale = Mathf.Lerp(scale, end, speed * Time.deltaTime);
		transform.localScale.y = scale;
		transform.localScale.z = scale;
		yield;
	}
	
	myTransform.localScale.y = Mathf.Round(scale * 100) / 100;
	myTransform.localScale.z = Mathf.Round(scale * 100) / 100;
	
	if (myTransform.localScale.y == 0) {
		renderer.enabled = false;
	}
}

function _ChangeTime () {

	if (periodPosition == 0)
		return;
		
	var scale : float = myTransform.localScale.y;
	if (scale > 0.001 && TimeController.scalePeriods[periodPosition] == 0)
		animation.Play("PinwheelEffectShrink");
	
	/*Debug.Log(TimeController.instance.GetCurrentScale() + ", " + timeScale);
	if (periodPosition > 0) {
		animation["PinwheelEffectGrow"].speed = 0.75;
		var scale : float = myTransform.localScale.y;
		if (TimeController.instance.GetCurrentScale() == timeScale) {
			Debug.Log("heard");
			if (scale < 1)
				animation.Play("PinwheelEffectGrow");
		} else if (TimeController.scalePeriods[periodPosition] == 0) {
			if (scale > 0.001)
				animation.Play("PinwheelEffectShrink");
		}
	}*/
}

function _CollectPill1 () {
	var scale : float = myTransform.localScale.y;
	if (scale < 1)
		animation.Play("PinwheelEffectGrow");
}

function _CollectPill2 () {
	var scale : float = myTransform.localScale.y;
	if (scale < 1)
		animation.Play("PinwheelEffectGrow");
}

function _CollectPill3 () {
	var scale : float = myTransform.localScale.y;
	if (scale < 1)
		animation.Play("PinwheelEffectGrow");
}

function _CollectPill4 () {
	var scale : float = myTransform.localScale.y;
	if (scale < 1)
		animation.Play("PinwheelEffectGrow");
}

function _CollectPill5 () {
	var scale : float = myTransform.localScale.y;
	if (scale < 1)
		animation.Play("PinwheelEffectGrow");
}

function _CollectPill6 () {
	var scale : float = myTransform.localScale.y;
	if (scale < 1)
		animation.Play("PinwheelEffectGrow");
}

function _CollectPill7 () {
	var scale : float = myTransform.localScale.y;
	if (scale < 1)
		animation.Play("PinwheelEffectGrow");
}
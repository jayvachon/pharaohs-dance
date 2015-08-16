#pragma strict
#pragma downcast

var percent : float = 1.0;							// 1.0 = full, 0.0 = empty
var backColor : Color = CustomColor.white;
var indicatorColor : Color = CustomColor.red;

var circular : boolean = true;						// True for circular, false for vertical
var circularMaterial : Material;
var verticalMaterial : Material;

var verticalTexture : Texture2D;
var verticalTextureFlip : Texture2D;

private var indicator : GameObject;
private var indicatorShadow : GameObject;
private var back : GameObject;
private var line : GameObject;

private var timeScale : float = 1.0;

private var testPercent : float = 1.0;

private var width : float;
private var height : float;
private var ratio : float;

private var pulseColor : Color;

@HideInInspector
var pulseWhenLow : boolean = false;

function Awake () {

	pulseWhenLow = false;

	width = Screen.width;
	height = Screen.height;
	
	ratio = width / height;
	
	for (var child : Transform in transform) {
		if (child.name == "Indicator") {
			indicator = child.gameObject;
		} else if (child.name == "LineParent") {
			line = child.gameObject;
		} else if (child.name == "Back") {
			back = child.gameObject;
		} else if (child.name == "IndicatorShadow") {
			indicatorShadow = child.gameObject;
		}
	}
	
	//var fullScreen : float = 1200.0;
	//var scale : float = Mathf.Lerp(35.0, 5.0, (height + 0.0) / fullScreen);
	var maxWidth : float = 1152.0;
	var scale : float = 16.5 * Mathf.Lerp(0.8, 1.0, Mathf.Min(1.0, (Screen.width + 0.0) / maxWidth));
	
	if (circular) {
		indicator.renderer.material = circularMaterial;
		indicatorShadow.renderer.material = circularMaterial;
	} else {
		indicator.renderer.material = verticalMaterial;
		indicatorShadow.renderer.material = verticalMaterial;
	}
	
	indicator.transform.localScale = Vector3(scale, 0.01, scale);
	indicatorShadow.transform.localScale = Vector3(scale, 0.01, scale);
	
	indicatorShadow.renderer.material.color = Color.black;
	
}

function Start () {
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("restart_game", this);
	InvokeRepeating("CountDown", 0.0, 0.5);
}

function SetMeterCircular (circ : boolean) {
	if (circ) {
		indicator.renderer.material = circularMaterial;
		indicatorShadow.renderer.material = circularMaterial;
	} else {
		indicator.renderer.material = verticalMaterial;
		indicatorShadow.renderer.material = verticalMaterial;
		indicatorShadow.renderer.material.color = Color.black;
	}
}

function FlipVerticalMeter (upsideDown : boolean) {
	if (upsideDown) {
		indicator.renderer.material.SetTexture("_MainTex", verticalTextureFlip);
		indicatorShadow.renderer.material.SetTexture("_MainTex", verticalTextureFlip);
	} else {
		indicator.renderer.material.SetTexture("_MainTex", verticalTexture);
		indicatorShadow.renderer.material.SetTexture("_MainTex", verticalTexture);
	}
}

function SetColor (bColor : Color, iColor : Color) {
	back.renderer.material.color = bColor;
	indicator.renderer.material.color = iColor; 
}

function SetPosition (x : float, y : float) {
	
	// Sets position on the screen (0,0 = bottom left; 1,1 = top right)
	
	var left : float = -100.0 * ratio;
	var bottom : float = -100.0;
	var right : float = 100 * ratio;
	var top : float = 100.0;
	
	//y -= (0.055); // when function is called, y is the top
	
	transform.position = Vector3(0.0, Mathf.Lerp(bottom, top, y), Mathf.Lerp(left, right, x)); 
}

function CountDown () {
	if (testPercent > 0.0) {
		testPercent -= 0.1;
	} else {
		testPercent = 1.0;
	}
	//LerpPercentage(testPercent, 0.5, true);
}

function SetPercentage (p : float) {
	percent = 1.0 - p;
	UpdateMeter();
}

function GetPercentage () {
	return Mathf.Abs(percent - 1.0);
}

function SetIndicatorColor (iColor : Color) {
	indicator.renderer.material.color = iColor;
}

function BeginPulse (iColor : Color) {
	pulseColor = iColor;
	StartCoroutine("PulseIndicatorColor");
}

function SetPulseColor (c : Color) {
	pulseColor = c;
} 

function PulseIndicatorColor () {
	
	var time : float = 0.25;
	var eTime : float = 0.0;
	var startColor : Color = indicator.renderer.material.color;
	
	while (true) {
		
		eTime = 0.0;
		time = 0.25;
		
		while (eTime < time) {
			eTime += Time.deltaTime;// * TimeController.timeScale;
			indicator.renderer.material.color = Color.Lerp(startColor, pulseColor, eTime / time);
			yield;
		}
		
		eTime = 0.0;
		time = 0.75;
		
		while (eTime < time) {
			eTime += Time.deltaTime;// * TimeController.timeScale;
			indicator.renderer.material.color = Color.Lerp(pulseColor, startColor, eTime / time);
			yield;
		}
	}
	
	//PulseIndicatorColor(iColor);
}

function LerpPercentage (endPercent : float, time : float, useTimeScale : boolean) {
	
	var eTime : float = 0.0;
	var startPercent : float = percent;
	var ts : float = 1.0;
	if (useTimeScale) {
		//ts = timeScale;
	}
	
	var rotation : Vector3 = line.transform.localEulerAngles;
	//var startRotation : Quaternion = line.transform.localRotation;
	//var endRotation : Quaternion = Quaternion.LookRotation(Vector3(rotation.x + (360.0 * endPercent), 0.0, 0.0));
	
	while (eTime < time) {
		
		eTime += Time.deltaTime * ts;
		percent = Mathf.Lerp(startPercent, endPercent, eTime / time);
		//line.transform.localRotation = Quaternion.Lerp(startRotation, endRotation, eTime / time);
		UpdateMeter();
		yield;
		
	}
}

function UpdateMeter () {
	indicator.renderer.material.SetFloat("_Cutoff", percent);
	indicatorShadow.renderer.material.SetFloat("_Cutoff", percent);
	if (pulseWhenLow) {
		if (percent > 0.75) {
			if (!animation.isPlaying) {
				animation.Play();
				BeginPulse(CustomColor.red);
			}
		} else {
			if (animation.isPlaying && transform.localScale.z >= 0.925 && transform.localScale.z <= 1.075) {
				animation.Stop();
				transform.localScale.z = 1.0;
				transform.localScale.y = 1.0;
				StopCoroutine("PulseIndicatorColor");
				SetIndicatorColor(CustomColor.white);
			}
		}
	}
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

function _RestartGame () {
	animation.Stop();
	transform.localScale.z = 1.0;
	transform.localScale.y = 1.0;
	
	StopCoroutine("PulseIndicatorColor");
	SetIndicatorColor(CustomColor.white);
}
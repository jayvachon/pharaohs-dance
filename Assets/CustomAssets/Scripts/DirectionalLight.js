#pragma strict

private var layer : int;
private var prevLayer : int;
private var maxIntensity : float;

function Start () {

	Messenger.instance.Listen("new_row", this);
	maxIntensity = light.intensity;
	
	SetNewLayer(10);
	prevLayer = 10;
	
}

function SetNewLayer (l : int) {
	layer = l;
	Fade(layer);
}

function Fade (newLayer : int) {
	
	var eTime : float = 0.0;
	var time : float = 0.25;
	var startIntensity : float = light.intensity;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		light.intensity = Mathf.Lerp(startIntensity, 0.0, eTime / time);
		yield;
	}
	
	NewLayer(newLayer);
	eTime = 0.0;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		light.intensity = Mathf.Lerp(0.0, maxIntensity, eTime / time);
		yield;
	}
	
}

function NewLayer (l : int) {
	light.cullingMask = (1 << l);
}

function _NewRow () {
	var row : int = Wheel.instance.playerRow;
	if (row <= 18) {
		row += 10;
	} else if (row <= 36) {
		row = (row - 18) + 10;
	} else {
		row = 10;
	}
	
	SetNewLayer(row);
}
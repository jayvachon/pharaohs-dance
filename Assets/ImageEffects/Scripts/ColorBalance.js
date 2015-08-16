/*
This script is intended for use with Fuzzy Quill's True Motion Blur for Unity free script.
Shader variable is intended for the ColorBalance shader that should have been provided
along with this script.

-Adam T. Ryder
http://1337atr.weebly.com
*/

@script RequireComponent (IndieEffects)
@script AddComponentMenu ("Indie Effects/Color Balance")
import IndieEffects;

private var mat : Material;
var shader : Shader;

var Lift : Color = Color(1.0, 1.0, 1.0, 1.0);
var LiftBright : float = 1.0;
var Gamma : Color = Color(1.0, 1.0, 1.0, 1.0);
var GammaBright : float = 1.0;
var Gain : Color = Color(1.0, 1.0, 1.0, 1.0);
var GainBright : float = 1.0;

function Start () {
	mat = new Material(shader);
	mat.SetColor("_Lift", Lift);
	mat.SetFloat("_LiftB", Mathf.Clamp(LiftBright, 0.0, 2.0));
	mat.SetColor("_Gamma", Gamma);
	mat.SetFloat("_GammaB", Mathf.Clamp(GammaBright, 0.0, 2.0));
	mat.SetColor("_Gain", Gain);
	mat.SetFloat("_GainB", Mathf.Clamp(GainBright, 0.0, 2.0));
	Messenger.instance.Listen ("change_time", this);
}

function Update () {
	// Uncomment to set color in inspector while playing game
	/*mat.SetColor("_Lift", Lift);
	mat.SetFloat("_LiftB", Mathf.Clamp(LiftBright, 0.0, 2.0));
	mat.SetColor("_Gamma", Gamma);
	mat.SetFloat("_GammaB", Mathf.Clamp(GammaBright, 0.0, 2.0));
	mat.SetColor("_Gain", Gain);
	mat.SetFloat("_GainB", Mathf.Clamp(GainBright, 0.0, 2.0));*/
	mat.SetTexture("_MainTex", renderTexture);
}

function LerpLift (time : float, color : Color) {
	
	var eTime : float = 0.0;
	var startColor : Color = Lift;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		Lift = Color.Lerp (startColor, color, eTime / time);
		mat.SetColor("_Lift", Lift);
		yield;
	}
}

function LerpGamma (time : float, color : Color) {
	
	var eTime : float = 0.0;
	var startColor : Color = Gamma;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		Gamma = Color.Lerp (startColor, color, eTime / time);
		mat.SetColor("_Gamma", Gamma);
		yield;
	}
}

function OnPostRender () {
	FullScreenQuad(mat);
}

function _ChangeTime () {
	var time : int = TimeController.instance.GetScalePosition ();
	var c : Color = (time == 0) ? Color.white : Color.Lerp (CustomColor.colorProgression[time], Color.white, 0.7);
	LerpGamma (1.0, c);
}
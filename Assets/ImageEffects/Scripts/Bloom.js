#pragma strict
/*
----------Bloom----------
This script was provided courtesy of tryder, and was tweaked by me for
optimization.
*/
@script RequireComponent (IndieEffects)
@script AddComponentMenu ("Indie Effects/Bloom(Color Accumulation)")
import IndieEffects;

private var mat : Material;
var shader : Shader;
var threshold : float = 1.0;
var amount : float = 1.0;
var AdditiveColor : Color32;
var rt2 : Texture2D;
private var tex : Texture2D;

function Start () {
	mat = new Material(shader);
	rt2 = Texture2D(Screen.width, Screen.height, TextureFormat.RGB24, false);
	mat.SetFloat("_Threshold", Mathf.Clamp(threshold, 0.0f, 1.0f));
	mat.SetFloat("_Amount", Mathf.Clamp(amount, 0.0f, 10.0f));
	mat.SetColor("_Color", AdditiveColor);	
}

function Update () {
	mat.SetTexture("_MainTex", renderTexture);
}

function OnPostRender () {
	rt2.ReadPixels(Rect(0,0,Screen.width, Screen.height), 0, 0);
	rt2.Apply();
	mat.SetTexture("_BlurTex", rt2);
	FullScreenQuad(mat);
}
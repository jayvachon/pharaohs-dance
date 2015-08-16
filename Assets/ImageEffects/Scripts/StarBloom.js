/*
This script is intended for use with Fuzzy Quill's True Motion Blur for Unity free script.

-Adam T. Ryder
http://1337atr.weebly.com
*/

@script RequireComponent (IndieEffects)
@script AddComponentMenu ("Indie Effects/Bloom (Star bokeh)")
import IndieEffects;

private var mat : Material;
var shader : Shader;
var offset : float = 1.0;
var threshold : float = 0.8;
var amount : float = 1.0;
var radius : float = 7;

private var tex : Texture2D;

function Start () {
	mat = new Material(shader);
	mat.SetFloat("_Threshold", Mathf.Clamp(threshold, 0.0f, 1.0f));
	if (radius > mat.passCount - 2) { radius = mat.passCount - 2; }
	if (radius <= 0) { radius = 1; }
	
	tex = new Texture2D (Screen.width, Screen.height, TextureFormat.RGB24, false);
}

function Update () {
	mat.SetTexture("_MainTex", renderTexture);
	mat.SetTexture("_BlurTex", tex);
}

function OnPostRender () {
	
	tex.ReadPixels(Rect(0,0,Screen.width,Screen.height), 0, 0);
	tex.Apply();
	
	var tmpOffset : float = Mathf.Clamp(offset, 0.0f, 10.0f);
	mat.SetFloat("_OffsetScale", tmpOffset);
	
	var tmpAmount : float = Mathf.Clamp(amount, 0.0f, 10.0f);
	mat.SetFloat("_Amount", tmpAmount);
	
	GL.PushMatrix();
	for (var i = 0; i < radius + 2; ++i) {
		
		mat.SetPass(i);
		GL.LoadOrtho();
		GL.Begin(GL.QUADS);
		GL.Color(Color(1,1,1,1));
		GL.MultiTexCoord(0,Vector3(0,0,0));
		GL.Vertex3(0,0,0);
		GL.MultiTexCoord(0,Vector3(0,1,0));
		GL.Vertex3(0,1,0);
		GL.MultiTexCoord(0,Vector3(1,1,0));
		GL.Vertex3(1,1,0);
		GL.MultiTexCoord(0,Vector3(1,0,0));
		GL.Vertex3(1,0,0);
		GL.End();
		
		if (i == 0) {
			tex.ReadPixels(Rect(0,0,Screen.width,Screen.height), 0, 0);
			tex.Apply();
			mat.SetTexture("_BlurTex", tex);
		} else if (i > 1) {
			tmpOffset += offset;
			mat.SetFloat("_OffsetScale", tmpOffset);
			if (i > 2) {
				tmpAmount -= amount / (radius);
				mat.SetFloat("_Amount", tmpAmount);
			}
		}
	}
	GL.PopMatrix();
	
}
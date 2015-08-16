using UnityEngine;
using System.Collections;

public class FXSaturator : FXBase {
	
	public FloatParameter saturation = new FloatParameter ("Saturation", "The amount of distortion", "%", 0f, 1f, 0f);

	public override void Start () {
		InitParameter (saturation);
	}
	
	public override float[] Process (float[] inData) {
		
		float[] outData = new float[inData.Length];
		float k = 2f * saturation.Value / (1f - saturation.Value);
		
		for (int i = 0; i < inData.Length; i ++) {
			outData[i] = (1f + k) * inData[i] / (1f + k * Mathf.Abs(inData[i]));
		}
		
		return outData;
		
	}
	
}

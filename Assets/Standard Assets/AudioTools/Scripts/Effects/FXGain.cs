using UnityEngine;
using System.Collections;

public class FXGain : FXBase {
	
	//public FloatParameter gain = new FloatParameter ("Gain", "Set the gain. The signal is multiplied by this amount", "X", 0f, 24f, 1f);
	public float gain;

	public override void Start () {
		//InitParameter (gain);
	}

	public override float[] Process (float[] inData) {
		
		float[] outData = new float[inData.Length];
		
		for (int i = 0; i < inData.Length; i ++) {
			outData[i] = inData[i] * gain; //gain.Value;
		}
		
		return outData;
		
	}
	
}

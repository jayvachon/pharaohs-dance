using UnityEngine;
using System.Collections;

public class FXLowpass : FXBase {
	
	private int sampleRate = 48000;	// TODO set this in FXBase
	//public FloatParameter frequency = new FloatParameter ("Frequency", "The cutoff frequency", "Hz", 20f, 20000f, 500f);
	//public FloatParameter resonance = new FloatParameter ("Resonance", "Resonance will apply some gain around the cutoff frequency. 0.1 is the loudest", "Q", 0.1f, 1.41f, 1.41f);
	public float frequency = 500f;
	private float resonance = 1.41f;

	public override void Start () {
		//InitParameter (frequency);
		//InitParameter (resonance);
	}

	public override float[] Process (float[] inData) {
		
		float[] outData = new float[inData.Length];
		
		float c = 1f / Mathf.Tan(Mathf.PI * frequency / sampleRate);
		float a1 = 1f / (1f + resonance * c + c * c);
		float a2 = 2f * a1;
		float a3 = a1;
		float b1 = 2f * (1f - c * c) * a1;
		float b2 = (1f - resonance * c + c * c) * a1;
		
		for (int i = 2; i < inData.Length; i ++) {
			outData[i] = a1 * inData[i] + a2 * inData[i - 1] + a3 * inData[i - 2] - b1 * outData[i - 1] - b2 * outData[i - 2];
		}
		
		return outData;
		
	}
	
}

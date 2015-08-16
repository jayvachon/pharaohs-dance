using UnityEngine;
using System.Collections;

public class FXReverse : FXBase {

	public override float[] Process (float[] inData) {
		
		float[] outData = new float[inData.Length];
		
		for (int i = 0; i < inData.Length; i ++) {
			outData[i] = inData[(inData.Length - 1) - i];
		}
		
		return outData;
		
	}
	
}

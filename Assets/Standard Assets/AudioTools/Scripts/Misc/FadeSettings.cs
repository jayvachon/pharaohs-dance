using UnityEngine;
using System.Collections;

[System.Serializable]
public class FadeSettings {

	public float startValue;
	public float endValue;
	public float fadeLength;
	public FadeType fadeType;
	public float power;

	public FadeSettings (float endValue, float fadeLength) :
		this (endValue, endValue, fadeLength, FadeType.Lin, 1f) { }

	public FadeSettings (float startValue, float endValue, float fadeLength) :
		this (startValue, endValue, fadeLength, FadeType.Lin, 1f) { }

	public FadeSettings (float endValue, float fadeLength, FadeType fadeType, float power) :
		this (endValue, endValue, fadeLength, fadeType, power) { }

	public FadeSettings (float startValue, float endValue, float fadeLength, FadeType fadeType, float power) {
		this.startValue = startValue;
		this.endValue = endValue;
		this.fadeLength = fadeLength;
		this.fadeType = fadeType;
		this.power = power;
	}

}

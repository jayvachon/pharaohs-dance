using UnityEngine;
using System.Collections;

public class SetParameterSettings<T> : TriggerSettings {

	public string effectName;
	public string parameterName;
	public T fromValue;
	public T toValue;
	public float fadeLength;
	public FadeType fadeType;
	public float power;
	
	public SetParameterSettings (string effectName, string parameterName, T toValue) :
	this (effectName, parameterName, toValue, toValue, 0f, FadeType.Lin, 1f) { } 

	public SetParameterSettings (string effectName, string parameterName, T toValue, float fadeLength) :
	this (effectName, parameterName, toValue, toValue, fadeLength, FadeType.Lin, 1f) { }

	public SetParameterSettings (string effectName, string parameterName, T toValue, float fadeLength, FadeType fadeType, float power) :
	this (effectName, parameterName, toValue, toValue, fadeLength, fadeType, power) { }
	
	public SetParameterSettings (string effectName, string parameterName, T fromValue, T toValue, float fadeLength, FadeType fadeType, float power) {
		this.effectName = effectName;
		this.parameterName = parameterName;
		this.fromValue = fromValue;
		this.toValue = toValue;
		this.fadeLength = fadeLength;
		this.fadeType = fadeType;
		this.power = power;
	}
}

[System.Serializable]
public class SetBoolParameterSettings : SetParameterSettings<bool> {
	public SetBoolParameterSettings (string effectName, string parameterName, bool toValue) :
	base (effectName, parameterName, toValue) { }
}

[System.Serializable]
public class SetIntParameterSettings : SetParameterSettings<int> {

	public SetIntParameterSettings (string effectName, string parameterName, int toValue) :
	this (effectName, parameterName, toValue, toValue, 0f, FadeType.Lin, 1f) { }

	public SetIntParameterSettings (string effectName, string parameterName, int toValue, float fadeLength) :
	this (effectName, parameterName, toValue, toValue, fadeLength, FadeType.Lin, 1f) { }

	public SetIntParameterSettings (string effectName, string parameterName, int toValue, float fadeLength, FadeType fadeType, float power) :
	this (effectName, parameterName, toValue, toValue, fadeLength, fadeType, power) { }

	public SetIntParameterSettings (string effectName, string parameterName, int fromValue, int toValue, float fadeLength, FadeType fadeType, float power) :
	base (effectName, parameterName, fromValue, toValue, fadeLength, fadeType, power) { }
}

[System.Serializable]
public class SetFloatParameterSettings : SetParameterSettings<float> {
	
	public SetFloatParameterSettings (string effectName, string parameterName, float toValue) :
	this (effectName, parameterName, toValue, toValue, 0f, FadeType.Lin, 1f) { }

	public SetFloatParameterSettings (string effectName, string parameterName, float toValue, float fadeLength) :
	this (effectName, parameterName, toValue, toValue, fadeLength, FadeType.Lin, 1f) { }

	public SetFloatParameterSettings (string effectName, string parameterName, float toValue, float fadeLength, FadeType fadeType, float power) :
	this (effectName, parameterName, toValue, toValue, fadeLength, fadeType, power) { }
	
	public SetFloatParameterSettings (string effectName, string parameterName, float fromValue, float toValue, float fadeLength, FadeType fadeType, float power) :
	base (effectName, parameterName, fromValue, toValue, fadeLength, fadeType, power) { }
}

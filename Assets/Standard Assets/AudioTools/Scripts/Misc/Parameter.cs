#pragma warning disable 0414

using UnityEngine;
using System.Collections;

public abstract class Parameter : Fadeable {
	
	public string name;
	public string tooltip;

	[System.NonSerialized]
	public FXBase fxbase;
	
	public virtual void Init (FXBase fxbase) { }
	
}

public class Parameter<T> : Parameter {
	
	public T _value;
	public T Value {
		get { return _value; }
		set { 
			_value = SetValue (value); 
			fxbase.UpdateData ();
		}
	}

	public Parameter (string name, string tooltip, T defaultValue) {
		this.name = name;
		this.tooltip = tooltip;
		this._value = defaultValue;
	}
	
	public override void Init (FXBase fxbase) {
		this.fxbase = fxbase;
	}

	public virtual float ScaleToFade (T v) { return 0f; }
	
	public virtual T SetValue (T val) { return val; }
	
}

[System.Serializable]
public class BoolParameter : Parameter<bool> {
	public BoolParameter (string name, string tooltip, bool defaultValue) : base (name, tooltip, defaultValue) { }
}

[System.Serializable]
public class IntParameter : Parameter<int> {

	[SerializeField]
	int min = 0;
	[SerializeField]
	int max = 1;
	[SerializeField]
	string measurement;
	
	public IntParameter (string name, string tooltip, string measurement, int min, int max, int defaultValue) : base (name, tooltip, defaultValue) {
		this.measurement = measurement;
		this.min = min;
		this.max = max;
	}

	public override float ScaleToFade (int v) {
		return (v - (float)min) / ((float)max - (float)min);
	}

	public override void OnFade () {
		Value = (int)Mathf.Lerp (min, max, fadeLevel);
	}
	
	public override int SetValue (int val) {
		return Mathf.Clamp (val, min, max);
	}
}

[System.Serializable]
public class FloatParameter : Parameter<float> {

	[SerializeField]
	float min = 0f;
	[SerializeField]
	float max = 1f;
	[SerializeField]
	string measurement;
	
	public FloatParameter (string name, string tooltip, string measurement, float min, float max, float defaultValue) : base (name, tooltip, defaultValue) {
		this.measurement = measurement;
		this.min = min;
		this.max = max;
	}

	public override float ScaleToFade (float v) {
		return (v - min) / (max - min);
	}

	public override void OnFade () {
		Value = Mathf.Lerp (min, max, fadeLevel);
	}
	
	public override float SetValue (float val) {
		return Mathf.Clamp (val, min, max);
	}
}



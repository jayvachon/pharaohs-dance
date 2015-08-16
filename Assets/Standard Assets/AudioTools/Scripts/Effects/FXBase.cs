using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class FXBase : MonoBehaviour {

	//public BoolParameter activated = new BoolParameter ("Activated", "Disable to bypass the effect", true);
	//public FloatParameter dryWet = new FloatParameter ("Dry/Wet", "Set the ratio of dry signal to wet signal", "%", 0f, 1f, 1f);
	public List<Parameter> parameters = new List<Parameter>();

	[System.NonSerialized]
	public EffectsManager effectsManager;
	
	void Awake () {
		//InitParameter (activated);
		//InitParameter (dryWet);
	}
	
	public void Init (EffectsManager em) {
		effectsManager = em;
	}
	
	public virtual void Start () {
		// In children, call:
		// InitParameter (childParamater1)
		// InitParameter (childParamater2)
		// ...
	}

	public void InitParameter (Parameter parameter) {
		parameters.Add (parameter);
		parameter.Init (this);
	}
	
	public Parameter SetParameter<T> (SetParameterSettings<T> ps) {

		Parameter<T> p = (Parameter<T>)GetParameter (ps.parameterName);

		if (ps.fadeLength == 0f) {
			p.Value = ps.toValue;
		} else {

			float from = p.ScaleToFade (ps.fromValue);
			float to = p.ScaleToFade (ps.toValue);

			// If the fromValue and toValue are the same, we assume that an overloaded version of SetParameterSettings
			// was used which did not have a fromValue parameter. So we fade from whatever the current fadeLevel is.
			if (from == to) {
				p.FadeTo (ps.fadeLength, to, ps.fadeType, ps.power); 
			} else {
				p.Fade (ps.fadeLength, from, to, ps.fadeType, ps.power);
			}
		}

		return p;
	}

	private Parameter GetParameter (string parameterName) {

		if (parameterName == "") { return null; }

		foreach (Parameter p in parameters) {
			if (p.name == parameterName) {
				return p;
			}
		}

		Debug.LogError ("There is no parameter named " + parameterName + " in " + GetType ().Name + " on " + gameObject.name);
		return null;
	}

	public float[] ExchangeData (float[] data) {
		//if (!activated.Value) { return data; }
		//return ProcessDryWet (Process (data), data);
		return data;
	}
	
	public virtual float[] Process (float[] inData) {
		return inData;
	}
	
	public float[] ProcessDryWet (float[] wetData, float[] dryData) {
		
		//if (dryWet.Value == 0f) { return dryData; }
		//if (dryWet.Value == 1f) { return wetData; }
		
		float[] outData = new float[dryData.Length];
		for (int i = 0; i < dryData.Length; i ++) {
			//outData[i] = (wetData[i] * dryWet.Value) + (dryData[i] * (1f - dryWet.Value));
		}
		
		return outData;
		
	}
	
	public void UpdateData () {
		if (effectsManager) effectsManager.UpdateData (this);
	}

	public virtual void OnPlay (AudioSource source) {
		return;
	}
}


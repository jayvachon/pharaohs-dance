using UnityEngine;
using System.Collections;

public class EffectsManager : MonoBehaviour {
	
	private FXBase[] fx;
	private AudioClip[] clips;
	private float[][] dryData;			// [clip][data]
	private float[][,] effectData;		// [clip][effect, data]

	public void Init (AudioClip[] _clips) {
		
		clips = _clips;
		if (clips.Length == 0) return;

		fx = GetComponents<FXBase>();
		if (fx == null) return;
		
		InitFX ();
		//InitDryData ();
		//InitEffectData ();
		//SetOutputData ();
		
	}
	
	private void InitFX () {
		foreach (FXBase f in fx) {
			f.Init (this);
		}
	}
	
	private void InitDryData () {
		dryData = new float[clips.Length][];
		for (int i = 0; i < clips.Length; i ++) {
			dryData[i] = new float[clips[i].samples * clips[i].channels];
			clips[i].GetData(dryData[i], 0);
		}
	}
	
	private void InitEffectData () {
		
		effectData = new float[clips.Length][,];
		for (int i = 0; i < clips.Length; i ++) {
			effectData[i] = new float[fx.Length + 1, dryData[i].Length];
		
			// The first effect element ([][0,]) in effectData will always be the dry data
			for (int j = 0; j < dryData[i].Length; j ++) {
				effectData[i][0, j] = dryData[i][j];
			}
		}
		ExchangeDataInEffects(1);
	}
	
	public Parameter SetParameter<T> (SetParameterSettings<T> ps) {

		FXBase f2 = GetEffect (ps.effectName);
		if (f2 == null) { return null; }
		else {
			return f2.SetParameter<T> (ps);
		}
	}

	private FXBase GetEffect (string effectName) {

		if (effectName == "") { return null; }

		foreach (FXBase f2 in fx) {
			if (f2.GetType ().Name == effectName) {
				return f2;
			}
		}

		Debug.LogError ("There is no effect named " + effectName + " on " + gameObject.name);
		return null;
	}

	private void ExchangeDataInEffects (int startPosition) {
		
		// Sends data down the effects chain
		// Data is sent to the effect at the startPosition, and then wet data is received back
		// This new data is then sent to the next effect, and so on
		// At the end, the last position in the array is our output data
		// We do this for each clip k
		
		for (int k = 0; k < clips.Length; k ++) {
			for (int i = startPosition; i < fx.Length + 1; i ++) {
				
				// Get the data from the previous position in the array to send to the effect
				float[] tempObjData = new float[dryData[k].Length];
				for (int j = 0; j < tempObjData.Length; j ++) {
					tempObjData[j] = effectData[k][i - 1, j];
				}
				
				// Send the data to the effect and receive back the new (wet) data
				float[] tempFXData = ExchangeData(fx[i - 1], tempObjData);
				for (int j = 0; j < tempFXData.Length; j ++) {
					
					// Add the wet data into our array
					effectData[k][i, j] = tempFXData[j];
				}
			}
		}
	}
	
	private float[] ExchangeData (FXBase f, float[] data) {
		return f.ExchangeData (data); 
	}
	
	public void UpdateData (FXBase f) {
		
		// When an effect has changed, update the data in all the effects below it
		int startPosition = 0;
		
		for (int i = 0; i < fx.Length; i ++) {
			if (fx[i] == f) {
				startPosition = i;
				break;
			}
		}
		
		ExchangeDataInEffects (startPosition + 1);
		SetOutputData ();
	}
	
	private void SetOutputData () {
		for (int j = 0; j < clips.Length; j ++) {
			float[] tempData = new float[dryData[j].Length];
			for (int i = 0; i < dryData[j].Length; i ++) {
				tempData[i] = effectData[j][fx.Length, i];
			}
			clips[j].SetData(tempData, 0);
		}
	}
	
	private void ResetData () {
		for (int i = 0; i < clips.Length; i ++) {
			clips[i].SetData(dryData[i], 0);
		}
	}
	
	public bool HasEffects () { return fx.Length > 0; }

	public void OnPlay (AudioSource source) {
		foreach (FXBase f in fx) {
			f.OnPlay (source);
		}
	}

	public void OnApplicationQuit () {
		//if (GetComponent<AudioSend>()) return;
		//ResetData (); 
	}
	
}
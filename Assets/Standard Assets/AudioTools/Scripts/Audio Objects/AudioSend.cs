using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class AudioSend : AudioEventTriggerable {
	
	private FXBase[] fx;
	private List<FXSend> senders = new List<FXSend>();

	void Awake () {
		fx = GetComponents<FXBase>();
		AudioSendManager.instance.sends.AddChild (GetComponent<AudioSend>());
	}

	public void AddSender (FXSend sender) {
		senders.Add (sender);
	}
	
	public float[] Process (float[] inData, EffectsManager effectsManager) {
		
		SetEffectsManager (effectsManager);
		
		float[] tempData = inData;
		foreach (FXBase f in fx) {
			tempData = f.Process (tempData);
		}
		return tempData;
		
	}
	
	public void SetEffectsManager (EffectsManager em) {
		foreach (FXBase f in fx) {
			f.Init (em);
		}
	}

	public override Parameter SetParameter<T> (SetParameterSettings<T> ps) {
		FXBase f2 = GetEffect (ps.effectName);
		if (f2 == null) { return null; }
		else {
			Parameter p = f2.SetParameter<T> (ps);
			UpdateSenders ();
			return p;
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

	private void UpdateSenders () {
		foreach (FXSend f in senders) {
			f.UpdateData ();
		}
	}
	
}

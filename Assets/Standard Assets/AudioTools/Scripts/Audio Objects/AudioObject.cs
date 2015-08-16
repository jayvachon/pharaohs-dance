using UnityEngine;
using System.Collections;

[RequireComponent (typeof (EffectsManager))]
public class AudioObject : AudioEventTriggerable {
	
	EffectsManager effectsManager;
	
	public AudioClip[] audioClips;
	
	void Start () {
		
		InitClips ();
		effectsManager = GetComponent<EffectsManager>();
		effectsManager.Init (audioClips);
		
	}
	
	public virtual void InitClips () { return; }

	public void OnPlay (AudioSource source) {
		effectsManager.OnPlay (source);
	}

	public override Parameter SetParameter<T> (SetParameterSettings<T> parameterSettings) {
		return effectsManager.SetParameter<T> (parameterSettings);
	}
}

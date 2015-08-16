using UnityEngine;
using System.Collections;

public abstract class AudioEventTriggerable : MonoBehaviour {

	public virtual void Play () { return; }
	
	public virtual void Play (PlaySettings playSettings) { return; }
	
	public virtual void Stop () { return; }
	
	public virtual void Stop (StopSettings stopSettings) { return; }
	
	public virtual Parameter SetParameter<T> (SetParameterSettings<T> parameterSettings) { return null; }

	public virtual void SetVolume (FadeSettings fadeSettings) { return; }

	public virtual void SetPan (FadeSettings fadeSettings) { return; }

	public virtual void Add (float amount) { return; }
	
	public virtual void Subtract (float amount) { return; }
	
	public virtual void Set (float amount) { return; }
	
}

#undef DEBUG

using UnityEngine;
using System.Collections;

public class AudioListenerLevels : MonoBehaviour {

	public float outputLevel = 0.67f;

#if (DEBUG)
	void Update () {
		float[] samples0 = new float[1024];
		float[] samples1 = new float[1024];
		AudioListener.GetOutputData ( samples0, 0 );
		AudioListener.GetOutputData ( samples1, 1 );
		float max = 0;
		foreach ( float s in samples0 ) {
			if ( s > max ) max = s;
		}
		foreach ( float s in samples1 ) {
			if ( s > max ) max = s;
		}
		if (max > 1) Debug.Log (max);
	}
#endif

	void OnAudioFilterRead ( float[] data, int channels ) {
		for ( int i = 0; i < data.Length; i ++ ) {
			data[i] *= outputLevel;
		}
	}
}

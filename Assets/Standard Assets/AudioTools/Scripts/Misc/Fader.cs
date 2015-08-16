using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// <para>Any class that wants to create a fade must inherit from this class.</para>
/// <para>To fade, simply call fadeableObject.Fade (fadeTime, startLevel, endLevel)</para>
/// <para>You can also use FadeIn (fadeTime) and FadeOut (fadeTime)
/// 	- These will fade from the current level to 1 and 0 respectively
/// 	- The exception to this rule is if the current level is already 1 or 0,
///			in which case the fade will start at 0 and 1 respectively.
/// 		Basically it assumes that you wouldn't want to fade in a sound 
/// 		that's already completely faded in, or fade out a sound already completely faded out</para>
/// </summary>

public enum FadeType {
	Lin,				// Linear ("straight line")
	Exp,				// Pointed top (slow-to-fast fade in, fast-to-slow fade out)
	Log					// Rounded top (fast-to-slow fade in, slow-to-fast fade out)
}

public class Fadeable {
	
	[System.NonSerialized]
	public List<bool> fading = new List<bool>();
	
	[System.NonSerialized]
	public float fadeLevel = 1f;
	public float FadeLevel {
		get { return fadeLevel; }
		set {
			fadeLevel = value;
			OnFade ();
		}
	}
	
	public virtual void OnFade () {
		return;
	}

	/// <summary>
	/// Fades to 1 from the current value, unless resetIfIn is set to true- in which case, if the value is already 1,
	/// we start from 0.
	/// </summary>
	public void FadeIn (float time) {
		FadeIn (time, true, FadeType.Lin, 1f);
	}

	public void FadeIn (float time, bool resetIfIn) {
		FadeIn (time, resetIfIn, FadeType.Lin, 1f);
	}

	public void FadeIn (float time, FadeType fadeType, float pow) {
		FadeIn (time, true, fadeType, pow);
	}

	public void FadeIn (float time, bool resetIfIn, FadeType fadeType, float pow) {
		if (resetIfIn) {
			if (FadeLevel > 0.99f) FadeLevel = 0f;
		}
		Fade (time, FadeLevel, 1f, fadeType, pow);
	}

	/// <summary>
	/// Fades to 0 from the current value, unless resetIfOut is set to true- in which case, if the value is already 0,
	/// we start from 1
	/// </summary>
	public void FadeOut (float time) {
		FadeOut (time, FadeType.Lin, 1f);
	}

	public void FadeOut (float time, bool resetIfOut) {
		FadeOut (time, resetIfOut, FadeType.Lin, 1f);
	}

	public void FadeOut (float time, FadeType fadeType, float pow) {
		FadeOut (time, true, fadeType, pow);
	}

	public void FadeOut (float time, bool resetIfOut, FadeType fadeType, float pow) {
		if (resetIfOut) {
			if (FadeLevel < 0.01f) FadeLevel = 1f;
		}
		Fade (time, FadeLevel, 0f, fadeType, pow);
	}

	/// <summary>
	/// Fades from the current value to a new value "end"
	/// </summary>
	public void FadeTo (float time, float end) {
		FadeTo (time, end, FadeType.Lin, 1f);
	}

	public void FadeTo (float time, float end, FadeType fadeType, float pow) {
		Fade (time, FadeLevel, end, fadeType, pow);
	}

	public void Fade (float time, float start, float end) {
		Fade (time, start, end, FadeType.Lin, 1f);
	}

	/// <summary>
	/// Fade from one value to another.
	/// </summary>
	public void Fade (float time, float start, float end, FadeType fadeType, float pow) {
		int position = AddFading ();
		CancelAllOtherFading (position);
		Fader.Instance.Fade (this, time, start, end, position, fadeType, pow);
	}
	
	public void CancelAllOtherFading (int keep) {
		for (int i = 0; i < fading.Count; i ++) {
			if (i != keep)
				fading[i] = false;
		}
	}
	
	public int AddFading () {
		if (fading.Count == 0) {
			fading.Add (true);
			return 0;
		}
		for (int i = 0; i < fading.Count; i ++) {
			if (!fading[i]) {
				fading[i] = true;
				return i;
			}
		}
		fading.Add (true);
		return fading.Count - 1;
	}
	
}

public class Fader : MonoBehaviour {
	
	public static Fader instance = null;
	public static Fader Instance {
		get {
			if (instance == null) {
				GameObject go = new GameObject ();
				instance = go.AddComponent<Fader>();
				go.name = "Fader";
			}
			return instance;
		}
	}
	
	public void Fade (Fadeable f, float time, float start, float end, int fadingPosition, FadeType fadeType, float pow) {
		StartCoroutine (CoFade (f, time, start, end, fadingPosition, fadeType, pow));
	}
	
	private IEnumerator CoFade (Fadeable f, float time, float start, float end, int fadingPosition, FadeType fadeType, float pow) {
			
		if (time == 0) yield break;
		float eTime = 0f;
		f.fading[fadingPosition] = true;
		f.FadeLevel = start;

		while (eTime < time && f.fading[fadingPosition]) {
			eTime += Time.deltaTime;
			switch (fadeType) {
				case FadeType.Lin:
					f.FadeLevel = Mathf.Lerp (start, end, eTime / time);
					break;
				case FadeType.Exp:
					f.FadeLevel = MathfExtended.SteepErp (start, end, pow, eTime / time); 
					break;
				case FadeType.Log:
					f.FadeLevel = MathfExtended.ShallowErp (start, end, pow, eTime / time);
					break;
			}
			yield return 0;
		}

		if (f.fading[fadingPosition]) {
			f.FadeLevel = end;
			f.fading[fadingPosition] = false;
		}
		
	}
	
}
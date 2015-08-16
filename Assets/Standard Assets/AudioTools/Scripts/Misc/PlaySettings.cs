using UnityEngine;
using System.Collections;

[System.Serializable]
public class PlaySettings : TriggerSettings {
	
	public bool onBeat = false;
	public Metronome metronome;
	public SnapStyle snapStyle = SnapStyle.BeatValue;
	public float beat = 1f;
	public float delay = 0f;
	public bool loop = false;
	public float fadeLength = 0f;
	public FadeType fadeType = FadeType.Lin;
	public float power = 1f;
	
	public PlaySettings () : 
		this (false, null, SnapStyle.BeatInMeasure, 0f, 0f, false, 0f, FadeType.Lin, 1f) { }
	
	public PlaySettings (float fadeLength) : 
		this (false, null, SnapStyle.BeatInMeasure, 0f, 0f, false, fadeLength, FadeType.Lin, 1f) { }
	
	public PlaySettings (Metronome metronome, float beat) : 
		this (true, metronome, SnapStyle.BeatValue, beat, 0f, false, 0f, FadeType.Lin, 1f) { }

	public PlaySettings (Metronome metronome, SnapStyle snapStyle, float beat, bool loop, float fadeLength) :
		this (true, metronome, snapStyle, beat, 0f, loop, fadeLength, FadeType.Lin, 1f) { }

	public PlaySettings (Metronome metronome, SnapStyle snapStyle, float beat, bool loop, float fadeLength, FadeType fadeType, float power) :
		this (true, metronome, snapStyle, beat, 0f, loop, fadeLength, fadeType, power) { }

	public PlaySettings (Metronome metronome, SnapStyle snapStyle, float beat, float delay, bool loop, float fadeLength, FadeType fadeType, float power) :
		this (true, metronome, snapStyle, beat, delay, loop, fadeLength, fadeType, power) { }
	
	public PlaySettings (bool onBeat, Metronome metronome, SnapStyle snapStyle, float beat, float delay, bool loop, float fadeLength, FadeType fadeType, float power) {
		this.onBeat = onBeat;
		this.metronome = metronome;
		this.snapStyle = snapStyle;
		this.beat = beat;
		this.delay = delay;
		this.loop = loop;
		this.fadeLength = fadeLength;
		this.fadeType = fadeType;
		this.power = power;
	}
}
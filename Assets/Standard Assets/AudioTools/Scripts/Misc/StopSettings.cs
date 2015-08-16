using UnityEngine;
using System.Collections;

[System.Serializable]
public class StopSettings : TriggerSettings {
	
	public bool onBeat;
	public Metronome metronome;
	public SnapStyle snapStyle;
	public float beat;
	public float delay;
	public float fadeLength;
	public FadeType fadeType;
	public float power;
	
	public StopSettings () : 
	this (false, null, SnapStyle.BeatInMeasure, 0f, 0f, 0f, FadeType.Lin, 1f) { }
	
	public StopSettings (float fadeLength) : 
	this (false, null, SnapStyle.BeatInMeasure, 0f, 0f, fadeLength, FadeType.Lin, 1f) { }
	
	public StopSettings (Metronome metronome, float beat) : 
	this (true, metronome, SnapStyle.BeatValue, beat, 0f, 0f, FadeType.Lin, 1f) { }

	public StopSettings (Metronome metronome, float beat, float fadeLength) : 
	this (true, metronome, SnapStyle.BeatValue, beat, 0f, fadeLength, FadeType.Lin, 1f) { }

	public StopSettings (Metronome metronome, SnapStyle snapStyle, float beat, float fadeLength, FadeType fadeType, float power) :
	this (true, metronome, snapStyle, beat, 0f, fadeLength, fadeType, power) { }
	
	public StopSettings (Metronome metronome, SnapStyle snapStyle, float beat, float delay, float fadeLength, FadeType fadeType, float power) :
	this (true, metronome, snapStyle, beat, delay, fadeLength, fadeType, power) { }

	public StopSettings (bool onBeat, Metronome metronome, SnapStyle snapStyle, float beat, float delay, float fadeLength, FadeType fadeType, float power) {
		this.onBeat = onBeat;
		this.metronome = metronome;
		this.snapStyle = snapStyle;
		this.beat = beat;
		this.delay = delay;
		this.fadeLength = fadeLength;
		this.fadeType = fadeType;
		this.power = power;
	}
}
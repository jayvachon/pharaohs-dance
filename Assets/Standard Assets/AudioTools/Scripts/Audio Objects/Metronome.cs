#undef DEBUG

using UnityEngine;
using System;
using System.Collections;

public class Metronome : AudioEventTriggerable {
	
	public struct Timing {
		
		public float beats;
		public int measures;
		public float totalBeats;
		
	}
	
	public class Settings {
		
		float bpm;
		public float BPM {
			get{ return bpm; }
			set { 
				if (value <= 0) return;
				bpm = value;
				beatTime = 60f/bpm;
			}
		}
		
		[System.NonSerialized]
		public float beatTime;
		int beatsPerMeasure;
		
		public Settings( float bpm = 120f, int beatsPerMeasure = 4 ) {
			this.BPM = bpm;
			this.beatsPerMeasure = beatsPerMeasure;
		}
		
		public Timing GetTimingData( float realTime ) { 
			Timing t = new Timing();
			t.totalBeats = realTime / beatTime;
			t.measures = (int)(t.totalBeats / beatsPerMeasure);
			t.beats = t.totalBeats % beatsPerMeasure + 1;
			return t;
		}
		
		public string PrettyString() {
			return string.Format ("{0}bpm ({1}/4)", bpm, beatsPerMeasure);	
		}
		
	}
	
	static float debugYPos =  10f;
	float myDebugYPos;
	
	public Settings settings;
	public Timing currentTiming;
	
	public float bpm = 120f;
	public int beatsPerMeasure = 4;
	public bool playImmediately = true;
	public bool useDSPTime = true;
	
	bool playing = false;
	float timeSinceStart;
	double dspStartTime;
	
	void Awake () {
		MetronomeManager.instance.metronomes.AddChild (GetComponent<Metronome>());
	}
	
	void Start () {
		
		settings = new Settings (bpm, beatsPerMeasure);
		if (playImmediately) Play ();
		dspStartTime = AudioSettings.dspTime;
		
		myDebugYPos = debugYPos;
		debugYPos += 20f;
		
	}
	
	public override void Play () { playing = true; }
	
	public override void Stop () { playing = false; }
	
	void Update () {
		if (playing) {
			if (useDSPTime) SetCurrentTimingDSPTime ();
			else SetCurrentTimingDeltaTime ();
		}
	}
	
	private void SetCurrentTimingDSPTime () {
		double dspTimeSinceStart = AudioSettings.dspTime - dspStartTime;
		currentTiming = settings.GetTimingData ((float)dspTimeSinceStart);
	}
	
	private void SetCurrentTimingDeltaTime () {
		currentTiming = settings.GetTimingData (timeSinceStart);
		timeSinceStart += Time.deltaTime;
	}
	
	#if (DEBUG)
	void OnGUI () {
		GUI.Label (new Rect(10, myDebugYPos, 500, 30), 
			string.Format( "{0}: {1}:{2:f2} (total beats: {3:f3})", 
			name, currentTiming.measures, currentTiming.beats, currentTiming.totalBeats ) );
	}
	#endif
	
}
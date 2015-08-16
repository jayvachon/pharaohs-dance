using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public delegate void PitchEventHandler (object source, int interval, int octave);

public class FXPitch : FXBase {

	[System.Serializable]
	public class Repeater {

		public AudioElement source;
		public Metronome metronome;
		public float delayBeats;
		public float delayRandomRange = 0f;
		public SnapStyle snapStyle;
		public float snapValue;

		private List<float> pitchSequence = new List<float>();
		private int sequencePosition = 0;

		private FXPitch sourcePitch;
		private Scale myScale;
		private AudioElement myElement;

		private float pitch;

		public void Init (Scale myScale, AudioElement myElement) {

			if (source == null) { return; }
			sourcePitch = source.GetComponent<FXPitch>();
			if (!sourcePitch) {
				Debug.LogError ("There is no FXPitch on " + source.name);
				return;
			} 
			sourcePitch.PitchEvent += new PitchEventHandler (PitchListener);

			this.myScale = myScale;
			this.myElement = myElement;
		}

		public void PitchListener (object source, int interval, int octave) {
			pitchSequence.Add (myScale.GetNote (interval, octave));
			myElement.Play (new PlaySettings(metronome, snapStyle, snapValue, RandomDelay (), false, 0f, FadeType.Lin, 1f));
		}

		private float RandomDelay () {
			return MathfExtended.RoundToMultiple (
				Random.Range (
					Mathf.Max (0f, delayBeats - delayRandomRange), 
					delayBeats + delayRandomRange), 
				0.125f);
		}

		public float GetPitch (float p) {
			pitch = pitchSequence[sequencePosition];
			sequencePosition ++;
			return pitch;
		}
	}
	
	[System.Serializable]
	public class Scale {

		//[Range(-12, 12)]
		public int root;
		public int rootNote;

		public PlayStyle playStyle;
		public enum PlayStyle {
			RandomNote,				// Randomly choose a note from the scale
			RandomPitch,			// Randomly choose a pitch
			Sequence,				// Move through a sequence of notes in the scale
			RandomFromSequence,		// Choose randomly from a sequence of notes in the scale
			Manual					// Set the notes manually
		}
		
		// If RandomPitch was selected
		public float pitchMin;
		public float pitchMax;

		public int octaveRange = 1;
		private float manualPitch = 1f;

		public ScaleType scaleType;
		public enum ScaleType {
			Chromatic,
			Major,
			Minor,
			Pentatonic
		}

		private float[] chromaticPitches = new float[12];

		// These scales must be in the order of the ScaleType enum
		private int[][] scaleIntervals = new int[][] { 	
			new int[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 },	
			new int[] { 0, 2, 4, 5, 7, 9, 11 },					
			new int[] { 0, 1, 3, 5, 6, 8, 10 },	
			new int[] { 0, 2, 4, 7, 9 }						
		};

		public int[] sequence = new int[0];
		private int sequencePosition = 0;

		[System.NonSerialized] public int lastPlayedInterval = 0;
		[System.NonSerialized] public int lastPlayedOctave = 1;


		public void Init () {
			InitChromaticPitches ();
		}

		private void InitChromaticPitches () {
			for (int i = 0; i < chromaticPitches.Length; i ++) {
				chromaticPitches[i] = GetPitchFromSemitones (i); 
			}
		}

		private float GetPitchFromSemitones (int semitones) {
			if (Mathf.Sign (semitones) == -1) {
				return 1f + (1f - Mathf.Pow (1.05946f, Mathf.Abs (semitones)));
			}
			return Mathf.Pow (1.05946f, Mathf.Abs (semitones));
		}

		public void SetPitch (int step, int octave) {
			manualPitch = GetNoteInScale (step, octave);
		}

		public void SetPitch (int step) {
			int scaleLength = scaleIntervals[(int)scaleType].Length - 1;
			int s = step;
			int octave = 1;
			while (s > scaleLength) {
				s -= scaleLength;
				octave ++;
			}
			manualPitch = GetNoteInScale (s, octave);
		}

		public float GetRandomPitch () {
			return Random.Range (pitchMin, pitchMax);
		}

		private float GetRandomNote () {
			int scale = (int)scaleType;
			int scalePosition = Random.Range (0, scaleIntervals[scale].Length);
			int octave = Random.Range (1, octaveRange + 1);
			return GetNoteInScale (scalePosition, octave);
		}

		private float GetNoteFromSequence (bool random) {

			int scaleLength = scaleIntervals[(int)scaleType].Length;
			int position = sequence [sequencePosition];
			if (random) { position = sequence [Random.Range (0, sequence.Length)]; }
			int positionWrapped = WrapValue (position, scaleLength);

			int octave = 1;
			if (position > scaleLength - 1) {
				octave = 2;
			}

			float p = GetNoteInScale (positionWrapped, octave);
			MoveSequence ();
			return p;
		}

		public float GetNoteInScale (int scalePosition, int octave) {
			int scale = (int)scaleType;
			int interval = scaleIntervals[scale][scalePosition];
			return GetNote (interval, octave);
		}

		public float GetNote (int interval, int octave) {

			int relativeInterval = interval + rootNote;
			int intervalWrapped = WrapValue (relativeInterval, chromaticPitches.Length);

			float tempOctave = 0f;
			if (relativeInterval < 0) {
				tempOctave = -0.5f;
			} else if (relativeInterval > 11) {
				tempOctave = 1f;
			}

			lastPlayedInterval = interval; 
			lastPlayedOctave = octave;

			return chromaticPitches [intervalWrapped] * ((float)octave + tempOctave);
		}

		public int WrapValue (int value, int max) {
			if (value < 0) {
				value += max;
			}
			if (value > max - 1) {
				value -= max;
			}
			return value;
		}

		private void MoveSequence () {
			if (sequencePosition < sequence.Length - 1) sequencePosition ++;
			else {
				sequencePosition = 0;
			}
		}

		public float GetPitch (float currentPitch) {
			switch (playStyle) {
				case PlayStyle.RandomFromSequence:
					return GetNoteFromSequence (true);
				case PlayStyle.RandomNote:
					return GetRandomNote ();
				case PlayStyle.RandomPitch:
					return GetRandomPitch ();
				case PlayStyle.Sequence:
					return GetNoteFromSequence (false);
				case PlayStyle.Manual:
					return manualPitch;
				default:
					return currentPitch;
			}
		}

	}

	public Scale scale;
	public Repeater repeater;
	public event PitchEventHandler PitchEvent;
	private AudioSource activeSource;
	private bool useRepeater = false;

	public override void Start () {

		if (!GetComponent<AudioElement>()) {
			Debug.LogError ("FXPitch must be attached to an AudioElement!");
			//activated.Value = false;
			return;
		}

		scale.Init ();
		repeater.Init (scale, GetComponent<AudioElement>());
		if (repeater.source) useRepeater = true;
	}

	public override void OnPlay (AudioSource source) {
		//if (!activated.Value) { return; }
		//activeSource = source;
		source.pitch = scale.GetPitch (source.pitch);
		if (useRepeater) {
			source.pitch = repeater.GetPitch (source.pitch);
		}
		TriggerPitchEvent ();
	}

	public void TriggerPitchEvent () {
		if (PitchEvent == null) return;
		PitchEvent (this, scale.lastPlayedInterval, scale.lastPlayedOctave);
	}

	public void SetPitch (int step) {
		scale.SetPitch (step);
	}

	public void SetPitch (int step, int octave) {
		scale.SetPitch (step, octave);
	}

}

using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class AudioElement : AudioObject {
	
	public class Sources {
		
		private AudioElement element;
		private AudioSource[] sources = new AudioSource[1];
		private bool randomVolume = false;
		
		public void Init (AudioElement _element, bool randomVolume) {
			element = _element;
			sources[0] = CreateAudioSource ();
			this.randomVolume = randomVolume;
		}
		
		public AudioSource Play (AudioClip clip, bool stopOtherSources) {
			float randVol = 1;
			if (randomVolume) randVol = Random.Range (0f, 1f);
			AudioSource a = FindNonplayingSource();
			if (a == null) { a = AddSource (); }
			a.clip = clip;
			a.volume = sources[0].volume * randVol;
			a.pan = sources[0].pan;
			a.Play ();
			if (stopOtherSources) { StopAllOtherSources (a); }
			return a;
		}
		
		public void Stop () {
			foreach (AudioSource a in sources) {
				a.Stop ();
			}
		}
		
		private void StopAllOtherSources (AudioSource a) {
			foreach (AudioSource aSource in sources) {
				if (aSource != a) { aSource.Stop (); }
			}
		}
		
		public void SetVolume (float v) {
			foreach (AudioSource a in sources) {
				a.volume = v;
			}
		}

		public void SetPan (float p) {
			foreach (AudioSource a in sources) {
				a.pan = p;
			}
		}
		
		private AudioSource FindNonplayingSource () {
			
			foreach (AudioSource a in sources) {
				if (!a.isPlaying) { return a; }
			}
			
			return null;
		}
		
		public bool IsPlaying () {
			
			foreach (AudioSource a in sources) {
				if (a.isPlaying) return true;
			}
			
			return false;
		}
		
		private AudioSource AddSource () {
			sources = ArrayExtended.AppendArray<AudioSource>(sources, CreateAudioSource());
			return sources[sources.Length - 1];
		}
		
		private AudioSource CreateAudioSource () {
			AudioSource a = element.gameObject.AddComponent ("AudioSource") as AudioSource;
			return a;
		}
		
	}
	
	public class Clips {
		
		private Settings settings;
		private AudioClip[] clips;
		private AudioClip prevClip;
		private int sequencePosition = 0;
		
		public void Init (Settings _settings, AudioClip[] _clips) {
			settings = _settings;
			clips = _clips;
		}
		
		public AudioClip GetClip () {
			
			switch (settings.playStyle) {
				
				case Settings.PlayStyle.Manual:
					return GetDefaultClip ();
				
				case Settings.PlayStyle.RandomClip:
					return GetRandomClip ();
				
				case Settings.PlayStyle.RandomNoRepeat:
					return GetRandomClipNoRepeat ();
				
				case Settings.PlayStyle.Sequence:
					return GetClipInSequence ();
			}
			
			return null;
			
		}
		
		public AudioClip GetDefaultClip () {
			return clips[0];
		}
		
		public AudioClip GetRandomClip () {
			return clips[Random.Range (0, clips.Length)];
		}
		
		public AudioClip GetRandomClipNoRepeat () {
			
			AudioClip c = GetRandomClip ();
			while (c == prevClip) { c = GetRandomClip (); }
			prevClip = c;
			return c;
		
		}
		
		public AudioClip GetClipInSequence () {
			
			AudioClip c = clips[settings.sequence[sequencePosition]];
			if (sequencePosition < settings.sequence.Length - 1) { sequencePosition ++; }
			else { sequencePosition = 0; }
			return c;
			
		}
		
	}
	
	[System.Serializable]
	public class Settings {
		
		[Range(0f, 1f)]
		public float volume = 1f;
		public float Volume {
			get { return volume; }
			set {
				if (value > 1f) return;
				volume = value;
			}
		}

		[Range(-1f, 1f)]
		public float pan = 0f;
		public float Pan {
			get { return pan; }
			set {
				volume = Mathf.Clamp (value, -1f, 1f);
			}
		}
		
		public enum PlayStyle {
			Manual,
			RandomClip,
			RandomNoRepeat,
			Sequence
		}
		
		public PlayStyle playStyle;
		public int[] sequence;
		
		public Settings (PlayStyle playStyle, float volume, float pan) {
			this.playStyle = playStyle;
			this.volume = volume;
			this.pan = pan;
		}
		
	}
	
	public class Volume : Fadeable {
		
		public float categoryLevel = 1f;
		public float CategoryLevel {
			get { return categoryLevel; }
			set {
				categoryLevel = value;
				Set ();
			}
		}
		
		public float elementLevel = 1f;
		public float ElementLevel {
			get { return elementLevel; }
			set {
				elementLevel = value;
				Set ();
			}
		}
		
		public float level = 1f;
		private Sources sources;
		
		public Volume (float elementLevel, float categoryLevel, Sources sources) {
			this.elementLevel = elementLevel;
			this.categoryLevel = categoryLevel;
			this.sources = sources;
			FadeLevel = 0f;
		}
		
		public void Set () {
			level = categoryLevel * elementLevel * FadeLevel;
			sources.SetVolume (level);
		}
		
		public override void OnFade () {
			Set ();
		}
		
		public void ResetFade () {
			FadeLevel = 1f;
			Set ();
		}
		
	}

	public class Pan : Fadeable {

		private float fadePan = 0f;
		private float FadePan {
			get { return fadePan; }
			set {
				fadePan = value;
				Set ();
			}
		}
		private Sources sources;

		public Pan (float pan, Sources sources) {
			this.sources = sources;
			FadePan = pan;
			FadeLevel = (FadePan + 1f) / 2f;
		}

		public void SetPan (float p) {
			FadeLevel = p;
		}

		public override void OnFade () {
			FadePan = Mathf.Lerp (-1f, 1f, FadeLevel);
		}

		private void Set () {
			sources.SetPan (fadePan);
		}
	}

	public Settings settings;
	public bool doNotOverlap = false;						// This ensures that if the sound is played in rapid succession, it won't overlap clips
	public bool randomVolume = false;
	Clips clips = new Clips ();
	Sources sources = new Sources ();

	[System.NonSerialized] public Volume volume;
	[System.NonSerialized] public Pan pan;

	private bool playing = false;
	private bool stopping = false;
	private bool looping = false;
	private List<float> beatWithClips = new List<float>();	// Whenever the AudioElement is played, this keep tracks of what beat the
															// clip is played at so that other clips don't get triggered at the
															// same time

	void Awake () {

		sources.Init (this, randomVolume);
		Category c 	= AudioElementManager.instance.AddElement (GetComponent<AudioElement>());
		volume 		= new Volume (settings.volume, c.volume.GetVolume (), sources);
		pan 		= new Pan (settings.pan, sources);
		beatWithClips.Add (0f);
	}
	
	public override void InitClips () {
		clips.Init (settings, audioClips);
	}

	public bool IsPlaying () {
		return sources.IsPlaying ();
	}
	
	/// <summary>
	/// Play the AudioElement. 
	/// To simply trigger the clip without snapping it to a beat, call Play() or Play(fadeLength) - where fadeLength is the fade in time
	/// </summary>

	public override void Play () {
		Play (0f, FadeType.Lin, 1f, clips.GetClip (), false);
	}
	
	public override void Play (PlaySettings ps) {
		
		stopping = false;
		
		if (!ps.onBeat) {
			Play (ps.fadeLength);
			return;
		}
		
		if (playing) { 
			volume.FadeIn (ps.fadeLength, false, ps.fadeType, ps.power); 
		}
		if (!playing || !looping) {
			playing = true;
			StartCoroutine (CoPlayOnBeat (ps));
		}
		
	}
	
	public void Play (float fadeLength) {
		Play (fadeLength, FadeType.Lin, 1f, clips.GetClip (), false);
	}
	
	private AudioClip Play (float fadeLength, FadeType fadeType, float power, AudioClip ac, bool stopOtherSources) {
		
		// Fade in if a fadeLength has been specified
		// If it hasn't, make sure the fade volume is all the way up
		if (fadeLength > 0f) { 
			volume.FadeIn (fadeLength, true, fadeType, power); 
		} else if (!looping) { 
			volume.ResetFade (); 
		}
		
		AudioSource s = sources.Play (ac, stopOtherSources);
		OnPlay (s);	// Certain FX need to be notified when the AudioElement is played

		return ac;
	}
	
	public IEnumerator CoPlayOnBeat (PlaySettings ps) {
		
		yield return StartCoroutine (DelayAndSnap (ps.metronome, ps.snapStyle, ps.beat, ps.delay));
		
		if (!stopping) {
			AudioClip ac = Play (ps.fadeLength, ps.fadeType, ps.power, clips.GetClip (), false);
			if (ps.loop) {
				looping = true;
				StartCoroutine (Loop (ps.metronome, ac));
			}
		}
		
	}
	
	public IEnumerator Loop (Metronome metro, AudioClip clip) {
		
		AudioClip c = clip;
		while (looping) {
			
			float start = Mathf.Floor (metro.currentTiming.totalBeats);
			float beats = GetClipBeatValue (metro, c);
			while (metro.currentTiming.totalBeats < start + beats) { yield return null; }
			if (looping) {
				c = clips.GetClip ();
				Play (0f, FadeType.Lin, 1f, c, true);
			}
			
		}
	}
	
	public float GetClipBeatValue (Metronome metro, AudioClip clip) {
		// TODO round to beat values < 1
		return Mathf.Round (clip.length / metro.settings.beatTime);
	}
	
	/// <summary>
	/// Stop this AudioElement
	/// </summary>
	
	public override void Stop () {
		Stop (0f, FadeType.Lin, 1f);
	}
	
	public void Stop (float fadeLength, FadeType fadeType, float power) {

		if (fadeLength == 0f) { 
			sources.Stop ();
			looping = false;
			playing = false;
			return;
		}
		
		volume.FadeOut (fadeLength, fadeType, power);
		StartCoroutine (DelayedStop (fadeLength));
	}
	
	public override void Stop (StopSettings ss) {
		
		if (!playing || stopping) return;
		
		stopping = true;
		if (!ss.onBeat) {
			Stop (ss.fadeLength, ss.fadeType, ss.power);
			return;
		}
		StartCoroutine (StopOnBeat (ss));
		
	}
	
	private IEnumerator DelayedStop (float delay) {
		
		float eTime = 0f;
		while (eTime < delay && stopping) {
			eTime += Time.deltaTime;
			yield return null;
		}
		
		if (stopping) {
			sources.Stop ();
			looping = false;
			playing = false;
		}
		
	}
	
	public IEnumerator StopOnBeat (StopSettings ss) {
		
		yield return StartCoroutine (DelayAndSnap (ss.metronome, ss.snapStyle, ss.beat, ss.delay));
		Stop (ss.fadeLength, ss.fadeType, ss.power);
		
	}
	
	/// <summary>
	/// The following coroutines are used to snap playing & stopping to the beat.
	/// </summary>
	
	public IEnumerator DelayAndSnap (Metronome metro, SnapStyle snap, float beat, float delay) {
		
		if (delay > 0f) { yield return StartCoroutine (DelayBeats (metro, delay)); }
		
		switch (snap) {
			
			case SnapStyle.BeatInMeasure:	
				yield return StartCoroutine (WaitForBeatInMeasure (metro, beat));
				break;
			
			case SnapStyle.BeatValue:
				yield return StartCoroutine (WaitForBeatValue (metro, beat));
				break;
			
		}
		
	}
	
	public IEnumerator DelayBeats (Metronome metro, float beat) {
		
		float start = Mathf.Floor (metro.currentTiming.totalBeats);
		while (metro.currentTiming.totalBeats < start + beat) { yield return null; }
		
	}
	
	public IEnumerator WaitForBeatInMeasure (Metronome metro, float beat) {
		
		while (Mathf.Floor (metro.currentTiming.beats) > beat) { yield return null; }
		while (metro.currentTiming.beats < beat) { yield return null; }
		
	}
	
	public IEnumerator WaitForBeatValue (Metronome metro, float beat) {

		float totalBeats = metro.currentTiming.totalBeats;
		float start = totalBeats % beat;

		// if things seem out of time:
		//while (metro.currentTiming.totalBeats % beat >= start) { 
		while (metro.currentTiming.totalBeats % beat > start) { 
			yield return null; 
		}

		if (doNotOverlap) {
			// This ensures that we don't overlap another clip if the two were triggered close together
			float snap = MathfExtended.RoundToMultiple (metro.currentTiming.totalBeats, beat);
			while (beatWithClips.Contains (snap)) {
				snap = MathfExtended.RoundToMultiple (metro.currentTiming.totalBeats, beat);
				yield return null;
			}
			beatWithClips.Add (snap);
		}
	}

	/// <summary>
	/// Volume 
	/// </summary>

	public override void SetVolume (FadeSettings fs) {
		if (fs.fadeLength > 0f)
			FadeVolume (fs);
		else
			volume.ElementLevel = fs.endValue;
	}

	public void FadeVolume (FadeSettings fs) {
		if (fs.fadeLength == 0f) {
			volume.ElementLevel = fs.endValue;
		}
		if (fs.startValue == fs.endValue) {
			volume.FadeTo (fs.fadeLength, 
			               fs.endValue, 
			               fs.fadeType, 
			               fs.power);
		} else {
			volume.Fade (fs.fadeLength, 
			             fs.startValue, 
			             fs.endValue, 
			             fs.fadeType, 
			             fs.power);
		}
	}

	public void SetVolume (float v) {
		volume.ElementLevel = v;
	}

	/// <summary>
	/// Panning
	/// </summary>

	public override void SetPan (FadeSettings fs) {
		if (fs.fadeLength > 0f)
			FadePan (fs);
		else
			pan.SetPan (fs.endValue);
	}

	public void FadePan (FadeSettings fs) {
		if (fs.fadeLength == 0f) {
			pan.SetPan (fs.endValue);
		}
		if (fs.startValue == fs.endValue) {
			pan.FadeTo (fs.fadeLength, 
			            fs.endValue, 
			            fs.fadeType, 
			            fs.power);
		} else {
			pan.Fade (fs.fadeLength, 
			          fs.startValue, 
			          fs.endValue, 
			          fs.fadeType, 
			          fs.power);
		}
	}

	public void SetPan (float p) {
		pan.SetPan (p);
	}
}

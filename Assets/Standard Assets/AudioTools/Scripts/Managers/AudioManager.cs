#define DEBUG

using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class AudioManager : Manager {

	public static AudioManager instance;
	public Children<Manager> managers;

	public static AudioElementManager elementManager;
	public static AudioEventManager eventManager;
	public static AudioSendManager sendManager;
	public static EnergyManager energyManager;
	public static MetronomeManager metronomeManager;

	void Awake () {
		if (instance == null) { instance = this; }
		managers = new Children<Manager>(transform);
	}

	void Start () {
		elementManager = (AudioElementManager)managers.GetChild ("AudioElementManager");
		eventManager = (AudioEventManager)managers.GetChild ("AudioEventManager");
		sendManager = (AudioSendManager)managers.GetChild ("AudioSendManager");
		energyManager = (EnergyManager)managers.GetChild ("EnergyManager");
		metronomeManager = (MetronomeManager)managers.GetChild ("MetronomeManager");
	}

	/**
	 * Global
	 */
	public static void StopAll (StopSettings stopSettings) {
		foreach (Category c in elementManager.categories.children) {
			c.Stop (stopSettings);
		}
	}

	/**
	 * Elements
	 */
	public static AudioElement GetElement (string name) {
		return elementManager.elements.GetChild (name);
	}

	// 1. Play
	public static AudioElement PlayElement (string name, PlaySettings playSettings) {
		AudioElement e = GetElement (name);
		e.Play (playSettings);
		return e;
	}

	// 2. Stop
	public static AudioElement StopElement (string name, StopSettings stopSettings) {
		AudioElement e = GetElement (name);
		e.Stop (stopSettings);
		return e;
	}

	// 3. Parameter
	public static AudioElement SetParameterInElement<T> (string name, SetParameterSettings<T> parameterSettings) {
		AudioElement e = GetElement (name);
		//e.SetParameter<T>(parameterSettings);
		return e;
	}

	// 4. Volume
	public static AudioElement SetElementVolume (string name, float volume) {
		AudioElement e = GetElement (name);
		e.SetVolume (volume);
		return e;
	}

	public static AudioElement SetElementVolume (string name, FadeSettings fadeSettings) {
		AudioElement e = GetElement (name);
		e.SetVolume (fadeSettings);
		return e;
	}

	// 5. Panning
	public static AudioElement SetPan (string name, float pan) {
		AudioElement e = GetElement (name);
		e.SetPan (pan);
		return e;
	}

	public static AudioElement SetPan (string name, FadeSettings FadeSettings) {
		AudioElement e = GetElement (name);
		e.SetPan (FadeSettings);
		return e;
	}

	public static AudioElement SetPan (string name, float pan, float fadeLength) {
		return SetPan (name, pan, fadeLength, FadeType.Lin, 1f);
	}

	public static AudioElement SetPan (string name, float pan, float fadeLength, FadeType fadeType, float power) {
		AudioElement e = GetElement (name);
		e.pan.FadeTo (fadeLength, pan, fadeType, power);
		return e;
	}

	public static AudioElement SetPan (string name, float fromPan, float toPan, float fadeLength, FadeType fadeType, float power) {
		AudioElement e = GetElement (name);
		e.pan.Fade (fadeLength, fromPan, toPan, fadeType, power);
		return e;
	}

	/**
	 * Categories
	 */
	public static Category GetCategory (string name) {
		return elementManager.categories.GetChild (name);
	}

	// 1. Play
	public static Category PlayCategory (string name, PlaySettings playSettings) {
		Category c = GetCategory (name);
		c.Play (playSettings);
		return c;
	}

	// 2. Stop
	public static Category StopCategory (string name, StopSettings stopSettings) {
		Category c = GetCategory (name);
		c.Stop (stopSettings);
		return c;
	}

	// 3. Volume
	public static Category SetCategoryVolume (string name, float volume) {
		Category c = GetCategory (name);
		c.volume.Level = volume;
		return c;
	}

	public static Category SetCategoryVolume (string name, FadeSettings fadeSettings) {
		Category c = GetCategory (name);
		c.SetVolume (fadeSettings);
		return c;
	}

	// 4. Panning
	public static Category SetCategoryPan (string name, float pan) {
		Category c = GetCategory (name);
		if (c) {
			c.SetPan (new FadeSettings (pan, 0f));
			return c;
		} else {
			//Debug.LogError ("Category " + name + " does not exist");
			return null;
		}
	}
	
	public static Category SetCategoryPan (string name, float pan, FadeSettings fadeSettings) {
		Category c = GetCategory (name);
		c.SetPan (fadeSettings);
		return c;
	}

	/**
	 * Events
	 */
	public static AudioEvent PlayEvent (string name) {
		AudioEvent e = GetEvent (name);
		e.Play ();
		return e;
	}

	public static AudioEvent StopEvent (string name) {
		AudioEvent e = GetEvent (name);
		e.Stop ();
		return e;
	}

	public static AudioEvent GetEvent (string name) {
		return eventManager.events.GetChild (name);
	}

	/**
	 * Sends
	 */
	public static AudioSend SetParameterInSend<T> (string name, SetParameterSettings<T> parameterSettings) {
		AudioSend s = GetSend (name);
		s.SetParameter<T>(parameterSettings);
		return s;
	}

	public static AudioSend GetSend (string name) {
		return sendManager.sends.GetChild (name);
	}

	/**
	 * Energies
	 */
	public static Energy AddEnergy (string name, float amount) {
		Energy e = GetEnergy (name);
		e.Add (amount);
		return e;
	}

	public static Energy SubtractEnergy (string name, float amount) {
		Energy e = GetEnergy (name);
		e.Subtract (amount);
		return e;
	}

	public static Energy SetEnergy (string name, float amount) {
		Energy e = GetEnergy (name);
		e.Set (amount);
		return e;
	}

	public static Energy GetEnergy (string name) {
		return energyManager.energies.GetChild (name);
	}

	/**
	 * Metronomes
	 */
	public static Metronome PlayMetronome (string name) {
		Metronome m = GetMetronome (name);
		m.Play ();
		return m;
	}

	public static Metronome StopMetronome (string name) {
		Metronome m = GetMetronome (name);
		m.Stop ();
		return m;
	}

	public static Metronome GetMetronome (string name) {
		return metronomeManager.metronomes.GetChild (name);
	}

#if DEBUG
	void Update () {
		if (Input.GetKeyDown (KeyCode.S)) {
			//PlayElement ("Beat", new PlaySettings());
			SetParameterInElement<float>("Beat", new SetParameterSettings<float>("FXLowpass", "Frequency", 20000f, 200f, 3f, FadeType.Exp, 16f));
		}
		if (Input.GetKeyDown (KeyCode.D)) {
			SetParameterInElement<float>("Beat", new SetParameterSettings<float>("FXLowpass", "Frequency", 20000f, 3f, FadeType.Exp, 16f));
		}
	}
#endif
}


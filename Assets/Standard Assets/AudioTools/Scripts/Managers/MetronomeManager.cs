using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class MetronomeManager : Manager {
	
	public static MetronomeManager instance;
	public Children<Metronome> metronomes;
	
	void Awake () {
		name = "MetronomeManager";
		if (instance == null) { instance = this; }
		metronomes = new Children<Metronome>(transform);
		AudioManager.instance.managers.AddChild (GetComponent<MetronomeManager>());
	}

}

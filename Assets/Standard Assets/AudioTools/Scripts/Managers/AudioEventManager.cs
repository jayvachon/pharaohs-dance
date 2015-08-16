using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class AudioEventManager : Manager {

	public static AudioEventManager instance;
	public Children<AudioEvent> events;

	void Awake () {
		name = "AudioEventManager";
		if (instance == null) { instance = this; }
		events = new Children<AudioEvent>(transform);
		AudioManager.instance.managers.AddChild (GetComponent<AudioEventManager>());
	}
	
}

using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class AudioSendManager : Manager {
	
	public static AudioSendManager instance;
	public Children<AudioSend> sends;
	
	void Awake () {
		name = "AudioSendManager";
		if (instance == null) { instance = this; }
		sends = new Children<AudioSend>(transform);
		AudioManager.instance.managers.AddChild (GetComponent<AudioSendManager>());
	}

}

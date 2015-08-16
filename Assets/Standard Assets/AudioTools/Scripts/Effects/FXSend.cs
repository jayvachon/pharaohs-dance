using UnityEngine;
using System.Collections;

public class FXSend : FXBase {
	
	public AudioSend audioSend;

	public override void Start () {
		audioSend.AddSender (this);
	}

	public override float[] Process (float[] inData) {
		return audioSend.Process (inData, effectsManager);
	}
	
}

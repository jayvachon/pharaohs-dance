using UnityEngine;
using System.Collections;

public delegate void EnergyEventHandler (object source, float val);

public class Energy : AudioEventTriggerable {
	
	public class Settings {
		
		public bool autoDecay = true;
		public float decayTime = 10f;		// Time in seconds it takes to go from 1 to 0
		public FadeType decayCurve;
		public float power;
		[System.NonSerialized]
		public float updateTime = 0.25f;	// We call Decay() every updateTime seconds
		
		public Settings (bool autoDecay, float decayTime, FadeType decayCurve, float power) {
			this.autoDecay = autoDecay;
			this.decayTime = decayTime;
			this.decayCurve = decayCurve;
			this.power = power;
		}
		
	}
	
	private float percent = 0f;
	public float Percent { 
		get { return percent;} 
		set {
			if (percent == Mathf.Clamp01 (value)) return;
			percent = Mathf.Clamp01 (value);
			float e = 0f;
			if (!autoDecay) {
				TriggerEnergyEvent (percent);
				return;
			}
			switch (decayCurve) {
				case FadeType.Lin:
					e = Mathf.Lerp (0f, 1f, percent);
					break;
				case FadeType.Exp:
					e = MathfExtended.SteepErp (0f, 1f, power, percent);
					break;
				case FadeType.Log:
					e = MathfExtended.ShallowErp (0f, 1f, power, percent);
					break;
			}
			TriggerEnergyEvent (e);
		} 
	}
	
	Settings settings;
	
	public bool autoDecay = true;
	public float decayTime = 10f;
	public FadeType decayCurve;
	public float power;

	public event EnergyEventHandler EnergyEvent;
	
	void Awake () {
		EnergyManager.instance.energies.AddChild (GetComponent<Energy>());
	}
	
	void Start () {
		
		settings = new Settings(autoDecay, decayTime, decayCurve, power);
		if (settings.autoDecay)
			InvokeRepeating ("Decay", 0f, settings.updateTime);
		
	}
	
	public override void Add (float amount) {
		Percent += amount;
	}
	
	public override void Subtract (float amount) {
		Percent -= amount;
	}
	
	public override void Set (float amount) {
		Percent = amount;
	}
	
	private void Decay () {
		Percent -= settings.updateTime / settings.decayTime;
	}
	
	private void TriggerEnergyEvent (float val) {
		EnergyEvent (this, val);
	}

	public float Get () {
		if (!autoDecay) {
			return Percent;
		}
		float e = 0f;
		switch (decayCurve) {
		case FadeType.Lin:
			e = Mathf.Lerp (0f, 1f, Percent);
			break;
		case FadeType.Exp:
			e = MathfExtended.SteepErp (0f, 1f, power, Percent);
			break;
		case FadeType.Log:
			e = MathfExtended.ShallowErp (0f, 1f, power, Percent);
			break;
		}
		return e;
	}
}

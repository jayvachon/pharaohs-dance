#undef DEBUG

using UnityEngine;
using System;
using System.Collections;

public class AudioEvent : AudioEventTriggerable {
	
	public enum Condition {
		EnergyGreaterThan,
		EnergyLessThan,
		TimeElapsed,
		BeatsElapsed
	}
	
	[System.Serializable]
	public class AutoTrigger {
		
		public Condition condition;
		public float conditionValue;
		private bool crossedValueThreshold = false;
		public float randomDeviation;					// Event will trigger when value is == conditionValue +/- randomDeviation
														// Randomization occurs every time the event is triggered
		public Energy energy;
		public Metronome metro;
		
		public TriggerAction action;
		private AudioEvent myEvent;
		
		public void Init (AudioEvent myEvent) {
			this.myEvent = myEvent;

			switch (condition) {
				case Condition.EnergyGreaterThan:
				case Condition.EnergyLessThan:
					if (energy) {
						energy.EnergyEvent += new EnergyEventHandler (EnergyListener);
					} else {
						Debug.LogError ("Event will never auto-trigger because you haven't given it an Energy object.");
					} 
					break;
				case Condition.TimeElapsed:
					StartTimeElapsed ();
					break;
				case Condition.BeatsElapsed:
					StartBeatsElapsed ();
					break;
			}
		}

		private float RandomTriggerValue () {
			return UnityEngine.Random.Range (conditionValue - randomDeviation, conditionValue + randomDeviation);
		}

		public void EnergyListener (object source, float val) {
			Trigger (val);
		}

		private void Trigger (float val) {
			float triggerValue = RandomTriggerValue ();
			switch (condition) {
				case Condition.EnergyGreaterThan:	EnergyGreaterThan (val, triggerValue);	break;
				case Condition.EnergyLessThan:		EnergyLessThan (val, triggerValue);		break;
				default: return;
			}
		}

		private void EnergyGreaterThan (float val, float triggerValue) {
			if (val < triggerValue) { 
				crossedValueThreshold = false; 
			}
			if (val >= triggerValue && !crossedValueThreshold) { 
				action.Trigger ();
				crossedValueThreshold = true;
			}
		}

		private void EnergyLessThan (float val, float triggerValue) {
			if (val > conditionValue) { 
				crossedValueThreshold = false; 
			}
			if (val < conditionValue && !crossedValueThreshold) { 
				action.Trigger (); 
				crossedValueThreshold = true;
			}
		}

		private void StartTimeElapsed () {
			float val = RandomTriggerValue ();
			myEvent.StartTimeElapsed (this, val);
		}

		public void EndTimeElapsed () {
			action.Trigger ();
			StartTimeElapsed ();
		}

		private void StartBeatsElapsed () {
			if (!metro) {
				Debug.LogError ("Event will never auto-trigger because you haven't given it a Metronome object.");
				return;
			}
			float val = RandomTriggerValue () * metro.settings.beatTime;
			myEvent.StartBeatsElapsed (this, val);
		}
		
		public void EndBeatsElapsed () {
			action.Trigger ();
			StartBeatsElapsed ();
		}
	}

	// These need to be outside of AutoTrigger because it isn't a MonoBehaviour
	public void StartTimeElapsed (AutoTrigger at, float time) {
		StartCoroutine (TimeElapsed (at, time));
	}
	
	private IEnumerator TimeElapsed (AutoTrigger at, float time) {
		yield return new WaitForSeconds (time);
		at.EndTimeElapsed ();
	}

	public void StartBeatsElapsed (AutoTrigger at, float time) {
		StartCoroutine (BeatsElapsed (at, time));
	}
	
	private IEnumerator BeatsElapsed (AutoTrigger at, float time) {
		yield return new WaitForSeconds (time);
		at.EndBeatsElapsed ();
	}
	
	[System.Serializable]
	public class TriggerAction {
		
		public AudioEventTriggerable triggerObject;
		
		public enum ActionType {
			Play,					// AudioEvents, AudioElements, Metronomes, Categories
			Stop,
			SetVolume,				// AudioElements, Categories
			SetPan,					// AudioElements, Categories
			SetParameter,			// AudioElements, AudioSends
			Add,					// Energies
			Subtract,
			Set
		}
		public ActionType actionType;

		public enum ActionTypeElement { Play, Stop, SetVolume, SetPan, SetParameter }
		public enum ActionTypeEvent { Play, Stop }
		public enum ActionTypeMetronome { Play, Stop }
		public enum ActionTypeCategory { 
			Play = 0, 
			Stop = 1,
			SetVolume = 2,
			SetPan = 3
		}
		public enum ActionTypeEnergy {
			Add = 5,
			Subtract = 6,
			Set = 7
		}
		public enum ActionTypeSend {
			SetParameter = 4
		}

		public ActionTypeElement actionTypeElement;
		public ActionTypeEvent actionTypeEvent;
		public ActionTypeMetronome actionTypeMetronome;
		public ActionTypeCategory actionTypeCategory;
		public ActionTypeEnergy actionTypeEnergy;
		public ActionTypeSend actionTypeSend;

		public PlaySettings playSettings;
		public StopSettings stopSettings;
		public FadeSettings fadeSettings;

		public enum ParameterType { Bool, Int, Float }
		public ParameterType parameterType;
		public SetBoolParameterSettings setBoolParameterSettings;
		public SetIntParameterSettings setIntParameterSettings;
		public SetFloatParameterSettings setFloatParameterSettings;
		
		public float energyValue = 0f;
		public float energyDeviation = 0f;

		public void Trigger () {

			SetActionType ();

			switch (actionType) {
				case ActionType.Play: 			Play (); 			break;
				case ActionType.Stop: 			Stop (); 			break;
				case ActionType.SetVolume:		SetVolume ();		break;
				case ActionType.SetPan:			SetPan ();			break;
				case ActionType.SetParameter: 	SetParameter (); 	break;
				case ActionType.Add:			Add ();				break;
				case ActionType.Subtract:		Subtract ();		break;
				case ActionType.Set:			Set ();				break;
			}
		}

		private void SetActionType () {
			if (triggerObject == null) return;
			switch (triggerObject.GetType().Name) {
				case "AudioElement":
					actionType = (ActionType)actionTypeElement;
					break;
				case "AudioEvent":
					actionType = (ActionType)actionTypeEvent;
					break;
				case "Metronome":
					actionType = (ActionType)actionTypeMetronome;
					break;
				case "Category":
					actionType = (ActionType)actionTypeCategory;
					break;
				case "Energy":
					actionType = (ActionType)actionTypeEnergy;
					break;
				case "AudioSend":
					actionType = (ActionType)actionTypeSend;
					break;
			}
		}
	
		private void Play () {
			string triggerName = triggerObject.GetType().Name;
			if (triggerName == "AudioElement" || triggerName == "Category")
				triggerObject.Play (playSettings);
			else
				triggerObject.Play ();
		}
		
		private void Stop () {
			string triggerName = triggerObject.GetType().Name;
			if (triggerName == "AudioElement" || triggerName == "Category")
				triggerObject.Stop (stopSettings);
			else
				triggerObject.Stop ();
		}

		private void SetVolume () {
			triggerObject.SetVolume (fadeSettings);
		}

		private void SetPan () {
			triggerObject.SetPan (fadeSettings);
		}

		private void SetParameter () {
			switch (parameterType) {
			case ParameterType.Bool:
				triggerObject.SetParameter<bool>(setBoolParameterSettings);
				break;
			case ParameterType.Int:
				triggerObject.SetParameter<int>(setIntParameterSettings);
				break;
			case ParameterType.Float:
				triggerObject.SetParameter<float>(setFloatParameterSettings);
				break;
			}
		}
		
		private void Add () {
			triggerObject.Add (RandomEnergyValue ());
		}
		
		private void Subtract () {
			triggerObject.Subtract (RandomEnergyValue ());
		}
		
		private void Set () {
			triggerObject.Set (RandomEnergyValue ());
		}

		private float RandomEnergyValue () {
			if (energyDeviation == 0f) { return energyValue; }
			return UnityEngine.Random.Range (energyValue - energyDeviation, energyValue + energyDeviation);
		}
	}

	public TriggerAction[] onPlay;
	public TriggerAction[] onStop;
	public AutoTrigger[] autoTrigger;

	void Awake () {
		AudioEventManager.instance.events.AddChild (GetComponent<AudioEvent>());
	}

	void Start () {
		foreach (AutoTrigger at in autoTrigger) {
			at.Init (this);
		}
	}
	
	public override void Play () {
		foreach (TriggerAction op in onPlay) {
			op.Trigger ();
		}
	}
	
	public override void Stop () {
		foreach (TriggerAction os in onStop) {
			os.Trigger ();
		}
	}

}

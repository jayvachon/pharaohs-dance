using UnityEngine;
using System.Collections;

public enum SnapStyle {
	BeatInMeasure,				// Trigger on a specific beat in the current measure  (e.g. play on beat 3 in the measure) 
	BeatValue,					// Trigger on any beat as long as its value matches x (e.g. play on the next quarter note)
}

public abstract class TriggerSettings {
	
}

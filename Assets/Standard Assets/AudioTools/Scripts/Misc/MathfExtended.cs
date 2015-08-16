using UnityEngine;
using System.Collections;

public static class MathfExtended {

	// Rounded top
	public static float ShallowErp (float from, float to, float pow, float t) {
		if (from < to) {
			return IEerp (from, to, pow, t);
		} else {
			return Eerp (from, to, pow, t);
		}
	}

	// Pointed top
	public static float SteepErp (float from, float to, float pow, float t) {
		if (from < to) {
			return Eerp (from, to, pow, t);
		} else {
			return IEerp (from, to, pow, t);
		}
	}

	// Fast to slow
	public static float IEerp (float from, float to, float pow, float t) {
		return from + (to - from) * Mathf.Pow (t, (1f / pow));
	}

	// Slow to fast
	public static float Eerp (float from, float to, float pow, float t) {
		return from + (to - from) * Mathf.Pow (t, pow);
	}

	public static float RoundToMultiple (float value, float multiple) {
		float inverse = 1f / multiple;
		return Mathf.Round (value * inverse) / inverse;
	}

	public static float CeilToMultiple (float value, float multiple) {
		float inverse = 1f / multiple;
		return Mathf.Ceil (value * inverse) / inverse;
	}
}

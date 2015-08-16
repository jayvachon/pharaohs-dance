using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public static class ArrayExtended {

	public static T[] AppendArray<T> (T[] array, T newValue) {
		
		int newLength = array.Length + 1;
		T[] newArray = new T[newLength];
		for (int i = 0; i < array.Length; i ++) {
			newArray[i] = array[i];
		}
		newArray[newLength - 1] = newValue;
		
		return newArray;
	}

	public static T[] GetComponentsInFirstChildren<T>(GameObject go) where T: Component {
		List<T> list = new List<T>();
		foreach (Transform child in go.transform) {
			T comp = child.GetComponent<T>();
			if (comp) list.Add (comp);
		}
		return list.ToArray();
	}

}

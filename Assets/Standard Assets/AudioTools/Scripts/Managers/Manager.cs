using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class Manager : MonoBehaviour {

	public class Children<T> where T: MonoBehaviour {

		public List<T> children = new List<T>();
		private Transform transform;
		private bool allowSubparenting; // If true, the child can be parented to an object of its same type (this allows for e.g. subcategories)

		public Children (Transform transform) : this (transform, false) {
			this.transform = transform;
		}

		public Children (Transform transform, bool allowSubparenting) {
			this.transform = transform;
			this.allowSubparenting = allowSubparenting;
		}

		public void AddChild (T t) {
			CheckNameForDoubles (t);
			children.Add (t);
			ParentNewChild (t);
		}

		public void AddChild (T t, Transform tform) {
			CheckNameForDoubles (t);
			children.Add (t);
			t.transform.parent = tform;
		}

		private void ParentNewChild (T t) {
			if (allowSubparenting) {
				if (!t.transform.parent || !t.transform.parent.GetComponent<T>()) {
					t.transform.parent = transform;
				}
			} else {
				t.transform.parent = transform;
			}
		}

		public T GetChild (string name) {
			foreach (T child in children) {
				if (child.name == name) { return child; }
			}
			//Debug.LogError ("Null: Could not find " + typeof(T).Name + " named " + name);
			return null;
		}

		public bool CheckNameForDoubles (T t) {

			int tNameCount = 0 ;
			foreach (T child in children) {
				if (child.name == t.name) {
					tNameCount ++;
				}
			}

			if (tNameCount <= 1) { return true; }
			else {
				Debug.LogWarning (string.Format ("You have {2} {0}s named {1}, please rename them.", typeof(T).Name, t.name, tNameCount));
				return false;
			}
		}
	}
}

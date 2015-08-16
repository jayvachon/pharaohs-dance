using UnityEngine;
using System.Collections;
using System.Collections.Generic;

// The AudioElementManager is a special manager. Instead of AudioElements being parented to the manager,
// they are parented into categories (or subcategories), and the categories are parented to the manager. 
// If an AudioElement has been created but not parented to a category, it is automatically added to the 
// "Default" category at runtime.

public class AudioElementManager : Manager {

	public static AudioElementManager instance;
	public Children<AudioElement> elements;
	public Children<Category> categories;

	void Awake () {
		name = "AudioElementManager";
		if (instance == null) { instance = this; }
		categories = new Children<Category>(transform, true);
		elements = new Children<AudioElement>(transform);
		AudioManager.instance.managers.AddChild (GetComponent<AudioElementManager>());
	}

	public Category AddElement (AudioElement e) {
		if (e.transform.parent == null || !e.transform.parent.GetComponent<Category>()) {
			if (!categories.GetChild ("Default")) {
				categories.AddChild (new GameObject ("Default", typeof (Category)).GetComponent<Category>()); 
			}
			elements.AddChild (e, categories.GetChild ("Default").transform);
			return categories.GetChild ("Default");
		} else {
			elements.AddChild (e, e.transform.parent);
			return e.transform.parent.GetComponent<Category>();
		}
	}
}

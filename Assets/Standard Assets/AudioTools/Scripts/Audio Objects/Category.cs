using UnityEngine;
using System.Collections;

public class Category : AudioEventTriggerable {

	[System.Serializable]
	public class Volume : Fadeable {

		[System.NonSerialized]
		public Category category;

		[System.NonSerialized]
		public float supraCategoryLevel = 1f;
		public float SupraCategoryLevel {
			get { return supraCategoryLevel; }
			set {
				supraCategoryLevel = Mathf.Clamp01 (value);
				SetChildVolumes ();
			}
		}

		[Range(0f, 1f)]
		public float level = 1f;
		public float Level {
			get { return level; }
			set { 
				level = Mathf.Clamp01 (value); 
				SetChildVolumes ();
			}
		}

		/*public Volume (Category category, float startVolume) {
			this.category = category;
			this.level = startVolume;
		}*/

		public override void OnFade () {
			SetChildVolumes ();
		}

		public void Set (float v) {
			Level = v;
		}

		private void SetChildVolumes () {
			float v = level * supraCategoryLevel * FadeLevel;
			category.SetChildVolumes (v);
		}

		public float GetVolume () {
			return level * supraCategoryLevel * FadeLevel;
		}

	}

	public Volume volume = new Volume();
	AudioElement[] elements;
	Category[] subcategories;

	void Awake () {
		volume.category = this;
		AudioElementManager.instance.categories.AddChild (GetComponent<Category>());
		elements = GetComponentsInChildren<AudioElement>();
		subcategories = ArrayExtended.GetComponentsInFirstChildren<Category>(gameObject); 
	}

	public override void Play () {
		foreach (AudioElement e in elements) {
			e.Play ();
		}
		foreach (Category c in subcategories) {
			c.Play ();
		}
	}

	public override void Play (PlaySettings playSettings) {
		foreach (AudioElement e in elements) {
			e.Play (playSettings);
		}
		foreach (Category c in subcategories) {
			c.Play (playSettings);
		}
	}

	public override void Stop () {
		foreach (AudioElement e in elements) {
			e.Stop ();
		}
		foreach (Category c in subcategories) {
			c.Stop ();
		}
	}

	public override void Stop (StopSettings stopSettings) {
		foreach (AudioElement e in elements) {
			e.Stop (stopSettings);
		}
		foreach (Category c in subcategories) {
			c.Stop (stopSettings);
		}
	}

	public override void SetVolume (FadeSettings fs) {
		if (fs.fadeLength > 0f)
			FadeVolume (fs);
		else
			SetVolume (fs.endValue);
	}

	public void FadeVolume (FadeSettings fs) {
		if (fs.fadeLength == 0f) {
			volume.Level = fs.endValue;
		}
		if (fs.startValue == fs.endValue) {
			volume.FadeTo (fs.fadeLength, 
			               fs.endValue, 
			               fs.fadeType, 
			               fs.power);
		} else {
			volume.Fade (fs.fadeLength, 
			             fs.startValue, 
			             fs.endValue, 
			             fs.fadeType, 
			             fs.power);
		}
	}
	
	public void SetVolume (float v) {
		volume.Level = v;
	}

	private void SetChildVolumes (float v) {
		foreach (AudioElement e in elements) {
			e.volume.CategoryLevel = v;
		}
		foreach (Category c in subcategories) {
			c.volume.SupraCategoryLevel = v;
		}
	}

	// Panning a category means that all elements will have the same pan- 
	// even if individually they were different before the category panned them,
	// so make sure it's what you want!
	public override void SetPan (FadeSettings fs) {
		if (fs.fadeLength > 0f) {
			foreach (AudioElement e in elements) {
				e.SetPan (fs.endValue);
			}
		} else {
			foreach (AudioElement e in elements) {
				e.SetPan (fs);
			}
		}
		foreach (Category c in subcategories) {
			c.SetPan (fs);
		}
	}
}

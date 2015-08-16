#undef fuckyou
using UnityEngine;

#if fuckyou
using UnityEditor;

[CustomPropertyDrawer (typeof (AudioEvent.AutoTrigger))]
public class AutoTriggerDrawer : PropertyDrawer {

	const int padding = 2;
	const int lineHeight = 16;
	Rect startRect;
	int currentLine = 0;
	int lines = 16;

	string objLabel;
	string valueLabel;
	string tooltip;
	bool useSlider = false;

	public override float GetPropertyHeight (SerializedProperty prop, GUIContent label) {
		return base.GetPropertyHeight (prop, label) + (lineHeight + padding) * lines;
	}

	public override void OnGUI (Rect pos, SerializedProperty prop, GUIContent label) {

		startRect = new Rect (pos.x, pos.y, pos.width, lineHeight);

		SerializedProperty condition 				= prop.FindPropertyRelative ("condition");
		SerializedProperty energy 					= prop.FindPropertyRelative ("energy");
		SerializedProperty metronome				= prop.FindPropertyRelative ("metro");
		SerializedProperty conditionValue 			= prop.FindPropertyRelative ("conditionValue");
		SerializedProperty randomDeviation 			= prop.FindPropertyRelative ("randomDeviation");
		SerializedProperty action					= prop.FindPropertyRelative ("action");

		EditorGUI.PropertyField (startRect, condition);

		switch (condition.enumValueIndex) {
			case 0: 
			case 1: 
				EditorGUI.PropertyField (NextRect (), energy);
				objLabel = "energy";
				valueLabel = "Percent";
				useSlider = true;
				break;
			case 2:
				objLabel = "time";
				valueLabel = "Seconds";
				useSlider = false;
				break;
			case 3:
				EditorGUI.PropertyField (NextRect (), metronome);
				objLabel = "metronome";
				valueLabel = "Beats";
				useSlider = false;
				break;
		}

		tooltip = string.Format("Event will trigger if {0} equals {1} +/- Deviation. Set to 0 for no randomness.", objLabel, valueLabel);
		if (useSlider) {
			EditorGUI.Slider (NextRect (), conditionValue, 0f, 1f, new GUIContent (valueLabel));
			EditorGUI.Slider (NextRect (), randomDeviation, 0f, conditionValue.floatValue, new GUIContent ("Deviation", tooltip));
		} else {
			EditorGUI.PropertyField (NextRect (), conditionValue, new GUIContent (valueLabel));
			EditorGUI.PropertyField (NextRect (), randomDeviation, new GUIContent ("Deviation", tooltip));
		}

		EditorGUI.PropertyField (NextRect (), action);

		currentLine = 0;
	}

	public Rect NextRect () {
		currentLine ++;
		Rect nextRect = startRect;
		nextRect.y += (currentLine * (lineHeight + padding));
		nextRect.height = lineHeight;
		return nextRect;
	}

}
#endif
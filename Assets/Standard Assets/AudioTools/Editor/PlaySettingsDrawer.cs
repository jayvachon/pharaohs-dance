using UnityEngine;
#if UNITY_EDITOR
/*using UnityEditor;

[CustomPropertyDrawer (typeof (PlaySettings))]
public class PlaySettingsDrawer : PropertyDrawer {
	
	const int padding = 2;
	const int lineHeight = 16;
	Rect startRect;
	int currentLine = 0;
	int lines = 16;

	public override float GetPropertyHeight (SerializedProperty prop, GUIContent label) {
		return base.GetPropertyHeight (prop, label) + (lineHeight + padding) * lines;
	}
	
	public override void OnGUI (Rect pos, SerializedProperty prop, GUIContent label) {

		startRect = new Rect (pos.x, pos.y, pos.width, lineHeight);

		SerializedProperty onBeat 				= prop.FindPropertyRelative ("onBeat");
		SerializedProperty metronome 			= prop.FindPropertyRelative ("metronome");
		SerializedProperty snapStyle			= prop.FindPropertyRelative ("snapStyle");
		SerializedProperty beat 				= prop.FindPropertyRelative ("beat");
		SerializedProperty delay 				= prop.FindPropertyRelative ("delay");
		SerializedProperty loop 				= prop.FindPropertyRelative ("loop");
		SerializedProperty fadeLength			= prop.FindPropertyRelative ("fadeLength");
		SerializedProperty fadeType				= prop.FindPropertyRelative ("fadeType");
		SerializedProperty power 				= prop.FindPropertyRelative ("power");

		EditorGUI.PropertyField (startRect, fadeLength);
		EditorGUI.PropertyField (NextRect (), fadeType);
		if (fadeType.enumValueIndex > 0) {
			EditorGUI.PropertyField (NextRect (), power);
		}

		EditorGUI.PropertyField (NextRect (), onBeat);

		if (!onBeat.boolValue) {
			currentLine = 0;
			return;
		}

		EditorGUI.PropertyField (NextRect (), metronome);
		EditorGUI.PropertyField (NextRect (), snapStyle);
		EditorGUI.PropertyField (NextRect (), beat);
		EditorGUI.PropertyField (NextRect (), delay);
		EditorGUI.PropertyField (NextRect (), loop);

		currentLine = 0;

	}

	public Rect NextRect () {
		currentLine ++;
		Rect nextRect = startRect;
		nextRect.y += (currentLine * (lineHeight + padding));
		nextRect.height = lineHeight;
		return nextRect;
	}
}*/
#endif
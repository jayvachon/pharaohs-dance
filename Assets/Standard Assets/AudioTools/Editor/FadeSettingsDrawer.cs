using UnityEngine;
#if UNITY_EDITOR
/*using UnityEditor;

[CustomPropertyDrawer (typeof (FadeSettings))]
public class FadeSettingsDrawer : PropertyDrawer {
	
	const int padding = 2;
	const int lineHeight = 16;
	Rect startRect;
	int currentLine = 0;
	int lines = 16;

	//bool fade = false;
	
	public override float GetPropertyHeight (SerializedProperty prop, GUIContent label) {
		return base.GetPropertyHeight (prop, label) + (lineHeight + padding) * lines;
	}
	
	public override void OnGUI (Rect pos, SerializedProperty prop, GUIContent label) {
		
		startRect = new Rect (pos.x, pos.y, pos.width, lineHeight);
		
		SerializedProperty startValue 			= prop.FindPropertyRelative ("startValue");
		SerializedProperty endValue 			= prop.FindPropertyRelative ("endValue");
		SerializedProperty fadeLength			= prop.FindPropertyRelative ("fadeLength");
		SerializedProperty fadeType 			= prop.FindPropertyRelative ("fadeType");
		SerializedProperty power 				= prop.FindPropertyRelative ("power");

		//fade = EditorGUI.Toggle (startRect, new GUIContent ("Fade"), fade);*/

		/*if (!fade) {
			EditorGUI.PropertyField (NextRect (), endValue);
			currentLine = 0;
			return;
		}*/

		/*EditorGUI.PropertyField (startRect, startValue);
		EditorGUI.PropertyField (NextRect (), endValue);
		EditorGUI.PropertyField (NextRect (), fadeLength);
		EditorGUI.PropertyField (NextRect (), fadeType);

		if (fadeType.enumValueIndex > 0) {
			EditorGUI.PropertyField (NextRect (), power);
		}
		
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
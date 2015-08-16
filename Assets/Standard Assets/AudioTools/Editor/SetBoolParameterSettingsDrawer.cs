using UnityEngine;
#if UNITY_EDITOR
/*using UnityEditor;

[CustomPropertyDrawer (typeof (SetBoolParameterSettings))]
public class SetBoolParameterSettingsDrawer : PropertyDrawer {
	
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
		
		SerializedProperty effectName 			= prop.FindPropertyRelative ("effectName");
		SerializedProperty parameterName		= prop.FindPropertyRelative ("parameterName");
		SerializedProperty toValue 				= prop.FindPropertyRelative ("toValue");
		
		EditorGUI.PropertyField (startRect, effectName);
		EditorGUI.PropertyField (NextRect (), parameterName);
		EditorGUI.PropertyField (NextRect (), toValue, new GUIContent ("Value"));
		
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
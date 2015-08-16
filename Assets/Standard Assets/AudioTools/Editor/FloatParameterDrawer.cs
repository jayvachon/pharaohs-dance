using UnityEngine;
#if UNITY_EDITOR
/*using UnityEditor;

[CustomPropertyDrawer (typeof (FloatParameter))]
public class FloatParameterDrawer : PropertyDrawer {

	float measurement = 25f;

	public override void OnGUI (Rect pos, SerializedProperty prop, GUIContent label) {
		SerializedProperty name = prop.FindPropertyRelative ("name");
		SerializedProperty tooltip = prop.FindPropertyRelative ("tooltip");
		SerializedProperty measurementName = prop.FindPropertyRelative ("measurement");
		SerializedProperty min = prop.FindPropertyRelative ("min");
		SerializedProperty max = prop.FindPropertyRelative ("max");
		SerializedProperty v = prop.FindPropertyRelative ("_value");

		EditorGUI.Slider (
			new Rect (pos.x, pos.y, pos.width - measurement, pos.height),
			v, min.floatValue, max.floatValue, new GUIContent (name.stringValue, tooltip.stringValue));

		EditorGUI.LabelField (
			new Rect (pos.x + pos.width - (measurement / 1.5f), pos.y, measurement, pos.height),
			new GUIContent (measurementName.stringValue));

	}
}*/
#endif
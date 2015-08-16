using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;

// Hiding/showing variables based on enum
//http://answers.unity3d.com/questions/288653/access-serializedproperty-for-custom-classes-c-1.html
//http://forum.unity3d.com/threads/83054-Inspector-Enum-dropdown-box-hide-show-variables

// Property Drawers
//http://blogs.unity3d.com/2012/09/07/property-drawers-in-unity-4/
//http://answers.unity3d.com/questions/295093/force-inspector-to-use-gettersetter.html

/*[CustomPropertyDrawer (typeof (BoolParameter))]
public class BoolParameterDrawer : PropertyDrawer {

	public override void OnGUI (Rect pos, SerializedProperty prop, GUIContent label) {
		SerializedProperty name = prop.FindPropertyRelative ("name");
		SerializedProperty tooltip = prop.FindPropertyRelative ("tooltip");
		SerializedProperty v = prop.FindPropertyRelative ("_value");

		EditorGUI.PropertyField (new Rect (pos.x, pos.y, pos.width, pos.height), v, new GUIContent (name.stringValue, tooltip.stringValue));
	}
}*/
#endif
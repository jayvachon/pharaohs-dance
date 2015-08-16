using UnityEngine;
#if UNITY_EDITOR
/*using UnityEditor;

[CustomPropertyDrawer (typeof (AudioEvent.TriggerAction))]
public class TriggerActionDrawer : PropertyDrawer {

	const int padding = 2;
	const int lineHeight = 16;
	Rect startRect;
	int currentLine = 0;
	int lines = 9;
	int actionTypeValueIndex = 0;
	int indexOffset = 0;
	GUIContent actionLabel = new GUIContent ("Action");

	public override float GetPropertyHeight (SerializedProperty prop, GUIContent label) {
		return base.GetPropertyHeight (prop, label) + (lineHeight + padding) * lines;
	}

	public override void OnGUI (Rect pos, SerializedProperty prop, GUIContent label) {
		
		startRect = new Rect (pos.x, pos.y, pos.width, lineHeight);

		SerializedProperty triggerObject 				= prop.FindPropertyRelative ("triggerObject");

		SerializedProperty actionType					= prop.FindPropertyRelative ("actionType");
		SerializedProperty actionTypeElement			= prop.FindPropertyRelative ("actionTypeElement");
		SerializedProperty actionTypeEvent				= prop.FindPropertyRelative ("actionTypeEvent");
		SerializedProperty actionTypeMetronome			= prop.FindPropertyRelative ("actionTypeMetronome");
		SerializedProperty actionTypeCategory			= prop.FindPropertyRelative ("actionTypeCategory");
		SerializedProperty actionTypeEnergy				= prop.FindPropertyRelative ("actionTypeEnergy");
		SerializedProperty actionTypeSend				= prop.FindPropertyRelative ("actionTypeSend");

		SerializedProperty playSettings					= prop.FindPropertyRelative ("playSettings");
		SerializedProperty stopSettings					= prop.FindPropertyRelative ("stopSettings");
		SerializedProperty fadeSettings					= prop.FindPropertyRelative ("fadeSettings");
		SerializedProperty parameterType				= prop.FindPropertyRelative ("parameterType");
		SerializedProperty setBoolParameterSettings 	= prop.FindPropertyRelative ("setBoolParameterSettings");
		SerializedProperty setIntParameterSettings 		= prop.FindPropertyRelative ("setIntParameterSettings");
		SerializedProperty setFloatParameterSettings 	= prop.FindPropertyRelative ("setFloatParameterSettings");
		SerializedProperty energyValue					= prop.FindPropertyRelative ("energyValue");
		SerializedProperty energyDeviation				= prop.FindPropertyRelative ("energyDeviation");

		EditorGUI.PropertyField (startRect, triggerObject);
		if (triggerObject.objectReferenceValue == null) {
			currentLine = 0;
			return;
		}

		// Change what enum we see based on the object that was dropped in
		switch (triggerObject.objectReferenceValue.GetType().Name) {
			case "AudioElement":
				EditorGUI.PropertyField (NextRect (), actionTypeElement, actionLabel);
				actionTypeValueIndex = actionTypeElement.enumValueIndex;
				indexOffset = 0;
				break;
			case "AudioEvent":
				EditorGUI.PropertyField (NextRect (), actionTypeEvent, actionLabel);
				actionTypeValueIndex = actionTypeEvent.enumValueIndex;
				indexOffset = 0;
				break;
			case "Metronome":
				EditorGUI.PropertyField (NextRect (), actionTypeMetronome, actionLabel);
				actionTypeValueIndex = actionTypeMetronome.enumValueIndex;
				indexOffset = 0;
				break;
			case "Category":
				EditorGUI.PropertyField (NextRect (), actionTypeCategory, actionLabel);
				actionTypeValueIndex = actionTypeCategory.enumValueIndex;
				indexOffset = 0;
				break;
			case "Energy":
				EditorGUI.PropertyField (NextRect (), actionTypeEnergy, actionLabel);
				actionTypeValueIndex = actionTypeEnergy.enumValueIndex;
				indexOffset = 5;
				break;
			case "AudioSend":
				EditorGUI.PropertyField (NextRect (), actionTypeSend, actionLabel);
				actionTypeValueIndex = actionTypeSend.enumValueIndex;
				indexOffset = 4;
				break;
		}

		if (actionTypeValueIndex == -1) {
			currentLine = 0;
			return;
		}
		actionType.enumValueIndex = actionTypeValueIndex + indexOffset;

		switch (actionType.enumValueIndex) {
			case 0:
				// Play
				EditorGUI.PropertyField (NextRect (), playSettings);
				break;
			case 1:
				// Stop
				EditorGUI.PropertyField (NextRect (), stopSettings);
				break;

			case 2:
				// SetVolume
				EditorGUI.PropertyField (NextRect (), fadeSettings);
				break;
			case 3:
				// SetPan
				EditorGUI.PropertyField (NextRect (), fadeSettings);
				break;	
			case 4:
				// SetParameter
				EditorGUI.PropertyField (NextRect (), parameterType);
				switch (parameterType.enumValueIndex) {
					case 0:
						EditorGUI.PropertyField (NextRect (), setBoolParameterSettings);
						break;
					case 1:
						EditorGUI.PropertyField (NextRect (), setIntParameterSettings);
						break;
					case 2:
						EditorGUI.PropertyField (NextRect (), setFloatParameterSettings);
						break;
				}
				break;
			case 5:
			case 6:
			case 7:
				// Add/Subtract/Set Energy
				EditorGUI.Slider (NextRect (), energyValue, 0f, 1f, new GUIContent ("Value"));
				EditorGUI.Slider (NextRect (), energyDeviation, 0f, energyValue.floatValue, new GUIContent ("Deviation"));
				break;
		}

		currentLine = 0;
		//lines = 0;

	}

	public Rect NextRect () {
		currentLine ++;
		//lines ++;
		Rect nextRect = startRect;
		nextRect.y += (currentLine * (lineHeight + padding));
		nextRect.height = lineHeight;
		return nextRect;
	}

}*/
#endif
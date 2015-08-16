#pragma strict

function OnGUI () {
	
	var t : float = Mathf.Round(Time.time);// * 10.0) / 10.0;
	GUI.color = Color.white;
	GUI.Label(Rect(10, 10, 100, 100), t.ToString());
	
}
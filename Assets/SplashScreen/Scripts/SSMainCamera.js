#pragma strict

function Start () {
	
	var ratio : float = (Screen.height + 0.0) / (Screen.width + 0.0);
	camera.orthographicSize = 100.0 + (50.0 * ((ratio - 0.5) * 2.0));
	
}

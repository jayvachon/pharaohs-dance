#pragma strict

function Start () {
	var yPos : float = -((Wheel.rows - 1) * Wheel.radius) + 2.0;
	transform.position = Vector3 (15.0, yPos, 6.5);
}

#pragma strict
#pragma downcast

var caster : Transform;
private var width : float;
private var scalePercent : Vector2 = Vector2(1.0, 1.0); 	// Shrinks shadow based on proximity to edge
private var minScale : float = 0.5;
private var maxScale : float = 20.0;
private var maxDistance : float = 30.0;

function Start () {
	//player = GameObject.FindGameObjectWithTag("Player").transform;
	for (var child : Transform in transform) {
		width = child.GetComponent(MeshFilter).mesh.bounds.size.x;
	}
}

function FixedUpdate () {

	var firstHit : RaycastHit;
	if (Physics.Raycast(caster.transform.position, Vector3.down, firstHit)) {
		//shadowY = firstHit.distance;
		var distance = firstHit.distance;
		var shadowRot = Quaternion.FromToRotation(Vector3.up, firstHit.normal);
	} else {
		distance = -100;
	}

	// Find how far the shadow is being cast
	//var distance : float = player.GetComponent(Player).shadowY;
	
	// Set position, scale, rotation, and transparency
	transform.position = Vector3(caster.transform.position.x, caster.transform.position.y - distance + 0.1, caster.transform.position.z);
	transform.localScale.x = Mathf.Lerp(minScale, maxScale, distance / maxDistance);
	transform.localScale.z = Mathf.Lerp(minScale, maxScale, distance / maxDistance);	
	transform.rotation = Quaternion.Lerp(transform.rotation, shadowRot, 5.0 * Time.deltaTime);
	for (var child : Transform in transform) {
		child.renderer.material.color.a = Mathf.Lerp(1.0, 0.0, distance / maxDistance);
	}
	
	
	/*Debug.DrawRay(player.transform.position, Vector3(0, -Mathf.Sin(angle), Mathf.Cos(angle)) * 10, Color.green,1);
	Debug.DrawRay(player.transform.position, Vector3(0, -Mathf.Sin(angle), -Mathf.Cos(angle)) * 10, Color.green,1);
	Debug.DrawRay(player.transform.position, Vector3(Mathf.Cos(angle), -Mathf.Sin(angle), 0) * 10, Color.green,1);
	Debug.DrawRay(player.transform.position, Vector3(-Mathf.Cos(angle), -Mathf.Sin(angle), 0) * 10, Color.green,1);*/
	
	// right side
	var angle : float = Mathf.Atan2(distance, width * transform.localScale.z * scalePercent.y);
	var vectorAngle : Vector3 = Vector3(0, -Mathf.Sin(angle), Mathf.Cos(angle));
	var hit : RaycastHit;	
	if (Physics.Raycast(caster.transform.position, vectorAngle, hit)) {
		if (scalePercent.y < 1.0)
			scalePercent.y = Mathf.Lerp(scalePercent.y, 1.0, 2.50 * Time.deltaTime);
	} else {
		if (scalePercent.y > 0.0) {
			scalePercent.y = Mathf.Lerp(scalePercent.y, 0.0, 2.50 * Time.deltaTime);
		}
	}
	
	// left side
	angle = Mathf.Atan2(distance, -width * transform.localScale.z * scalePercent.x);
	vectorAngle = Vector3(0, -Mathf.Sin(angle), Mathf.Cos(angle));	
	if (Physics.Raycast(caster.transform.position, vectorAngle, hit)) {
		if (scalePercent.x < 1.0)
			scalePercent.x = Mathf.Lerp(scalePercent.x, 1.0, 2.50 * Time.deltaTime);
	} else {
		if (scalePercent.x > 0.0) {
			scalePercent.x = Mathf.Lerp(scalePercent.x, 0.0, 2.50 * Time.deltaTime);
		}
	}

	
	for (var child : Transform in transform) {
		if (Mathf.RoundToInt(child.transform.localEulerAngles.y) == 270) {
			child.transform.localScale.x = scalePercent.y;
		} else {
			child.transform.localScale.x = scalePercent.x;
		}
	}

}


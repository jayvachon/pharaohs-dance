#pragma strict

var endStep : GameObject;

private var startPosition : Vector3;
private var steps : int = 200;
private var stepSize : float = 4.5;
private var startX : int;

private var playerOnTop : boolean = false;

function Start () {
	
	transform.position.y = (Wheel.radius * (Wheel.rows + 1));
	
	startPosition = transform.position;
	
	startX = (steps * stepSize) - Mathf.Abs(startPosition.x);
	
	for (var i = 0; i < steps; i ++) {
		var pos : Vector3 = Vector3(startPosition.x + (i * stepSize), startPosition.y, startPosition.z);
		var es : GameObject = GameObject.Instantiate(endStep, pos, Quaternion.identity);
		es.transform.parent = this.transform;
	}
	
	var box : BoxCollider = gameObject.GetComponent(BoxCollider);
	box.size.x = steps * stepSize;
	box.center.x = (steps * stepSize) / 2;
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Net") {
		if (!playerOnTop) {
			new MessageEnterEnd();
			playerOnTop = true;
		}
	}
}

function OnTriggerExit (other : Collider) {
	if (other.tag == "Net") {
		if (playerOnTop) {
			new MessageExitEnd();
			playerOnTop = false;
		}
	}
}

function GetStartX () {
	return startX;
}

function GetEndX () {
	return transform.position.x;
}

function GetDisX () : float {
	return ((steps + 0.0) * stepSize);
}
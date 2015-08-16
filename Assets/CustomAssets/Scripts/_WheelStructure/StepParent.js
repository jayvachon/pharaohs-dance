#pragma strict

private var colliders : Component[];
private var row = 0;

function Start () {	
	colliders = GetComponentsInChildren(Collider);
	Messenger.instance.Listen("new_row", this);
}

function _NewRow () {
	if (Mathf.Abs(Wheel.playerRow - row) > 1) {
		DisableColliders();
	} else {
		EnableColliders();
	}
}

function DisableColliders () {
	for (var i = 0; i < colliders.Length; i++) {
		colliders[i].collider.enabled = false;
	}
}

function EnableColliders () {
	for (var i = 0; i < colliders.Length; i++) {
		colliders[i].collider.enabled = true;
	}
}


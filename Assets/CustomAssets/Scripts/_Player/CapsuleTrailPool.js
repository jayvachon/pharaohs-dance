#pragma strict
#pragma downcast

var capsuleTrail : GameObject;

private var trails : GameObject[] = new GameObject[20];
private var trailCount : int;
private var availableTrail : int;

private var myTransform : Transform;
static var instance : CapsuleTrailPool;

function Awake () {
	myTransform = transform;
	instance = this;
	
	trailCount = trails.Length;
	for (var i = 0; i < trailCount; i ++) {
		trails[i] = GameObject.Instantiate(capsuleTrail, myTransform.position, Quaternion.identity);
		//trails[i].active = false;
		for (var child : Transform in trails[i].transform) {
			child.gameObject.SetActive(false);
			for (var c : Transform in child) {
				c.gameObject.SetActive(false);
			}
		}
		trails[i].SetActive(false);
	}
}

function Instantiate (position : Vector3) : GameObject {
	
	//trails[availableTrail].active = true;
	trails[availableTrail].gameObject.SetActive(true);
	for (var child : Transform in trails[availableTrail].transform) {
		child.gameObject.SetActive(true);
		for (var c : Transform in child) {
			c.gameObject.SetActive(true);
		}
	}
	trails[availableTrail].transform.position = position;
	trails[availableTrail].GetComponent(CapsuleTrail).Enable();
	
	if (availableTrail < trailCount - 1) {
		availableTrail ++;
	} else {
		availableTrail = 0;
	}
	
	return trails[availableTrail];
}
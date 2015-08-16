#pragma strict

/*
*
*	This object holds a number of objects at its position. During gameplay these objects are "created" by moving them
*	to a new position. They are "destroyed" by moving them back here. This should prevent memory leaks that occur
*	when there is a lot of instantiating and destroying.
*
*/

var baseArrayObjects : GameObject[] = new GameObject[1];
var baseArrayObjectCounts : int[] = new int[1];
private var baseArrays : ObjectBaseArray[];

private var myTransform : Transform;
static var instance : ObjectBase;

function Awake () {
	instance = this;
	myTransform = transform;
	
}

function Start () {
	
	// Create as many platforms as we're going to need, given the size of the wheel
	var platCount : int = 0;
	for (var j = 0; j < Wheel.rows; j ++) {
		platCount += (j + 1) * Wheel.columns;
	}
	
	baseArrayObjectCounts[0] = platCount;
	baseArrayObjectCounts[2] = platCount;
	baseArrayObjectCounts[8] = platCount / 2;
	baseArrayObjectCounts[12] = platCount / 2;
	baseArrayObjectCounts[13] = platCount / 2;
	baseArrayObjectCounts[14] = platCount / 2;
	baseArrayObjectCounts[16] = platCount / 2;
	baseArrayObjectCounts[20] = platCount;
	//baseArrayObjectCounts[18] = platCount;
	
	// Create arrays	
	baseArrays = new ObjectBaseArray[baseArrayObjects.length];

	for (var i = 0; i < baseArrayObjects.length; i ++) {
		baseArrays[i] = new ObjectBaseArray(baseArrayObjects[i], baseArrayObjectCounts[i], myTransform.position);
	}	
}

function Instantiate (go : GameObject, pos : Vector3) {
	
	for (var i = 0; i < baseArrayObjects.length; i ++) {
		if (go == baseArrayObjects[i]) {
			return baseArrays[i].Instantiate(pos);
		}
	}
	Debug.Log(go + " is not a member of ObjectBase");
	return null;
	
}

function Destroy (instance : GameObject) {
	for (var i = 0; i < baseArrayObjects.length; i ++) {
		if (instance.gameObject.name == baseArrayObjects[i].name + "(Clone)") {
			baseArrays[i].Destroy(instance);
		}
	}
	//Debug.Log(instance + " cannot be destroyed because it does not exist");
}
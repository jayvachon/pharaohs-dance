#pragma strict

class ObjectBaseArray extends System.Object {

	public var object : GameObject;
	public var count : int;
	public var instances : GameObject[];
	public var position : Vector3;
	public var maxObjects : int = 0;
	
	function ObjectBaseArray (_object : GameObject, _count : int, _position : Vector3) {
		object = _object;
		count = _count;
		position = _position;
		instances = new GameObject[10000];
		
		// Create an array of instances of type object
		for (var i = 0; i < count; i ++) {
			instances[i] = GameObject.Instantiate(object, position, Quaternion.identity);
			//instances[i].gameObject.active = false;
			//instances[i].SetActiveRecursively(false);
			instances[i].gameObject.SetActive(false);
		}	
	
	}
	
	function Instantiate (pos : Vector3) {
		
		// Move an instance into position and activate it
		for (var i = 0; i < count; i ++) {
			if (instances[i].transform.position == position) {
				instances[i].transform.position = pos;
				//instances[i].gameObject.active = true;
				//instances[i].SetActiveRecursively(true);	
				instances[i].SetActive(true);
				if (maxObjects < i) {
					maxObjects = i;
					//Debug.Log(object + ": " + maxObjects);
				}
				return instances[i];
			}
		}
		//Debug.Log("No more instances of " + object.name + "!");
		//return null;
		
		// if all instances are currently being used, make a new one
		instances[count] = GameObject.Instantiate(object, position, Quaternion.identity);
		instances[count].transform.position = pos;
		//instances[count].gameObject.active = true;
		//instances[count].SetActiveRecursively(true);
		instances[count].gameObject.SetActive(true);
		count ++;
		
		return instances[count - 1];
		
	}
	
	function Destroy (instance : GameObject) {
		
		// Move the instance back to its start position and deactivate it
		//instance.gameObject.active = false;
		instance.gameObject.SetActive(false);
		//instance.SetActiveRecursively(false);
		instance.SetActive(false);
		instance.transform.position = position;		
	}
	
}
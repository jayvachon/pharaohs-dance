#pragma strict

class ViewObjectArray extends System.Object {
	
	public var object : GameObject;
	public var instances : GameObject[] = new GameObject[500];
	
	function ViewObjectArray (_object : GameObject) {
		object = _object;
		instances = GameObject.FindGameObjectsWithTag(object.tag) as GameObject[];
	}
	
	function ActivateObjectsInsideViewPort () {
		
	}
}
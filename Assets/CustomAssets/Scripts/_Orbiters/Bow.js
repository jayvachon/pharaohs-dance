#pragma strict

private var myTransform : Transform;
private var timeScale : float = 1.0;
private var speed : float = 150.0;

function Awake () {
	myTransform = transform;
}

function Start () {
	for (var child : Transform in myTransform) {
		if (child.GetComponent (Renderer)) {
			child.renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.red);	
		}
		for (var child2 : Transform in child) {
			if (child2.GetComponent (Renderer)) {
				child2.renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.red);	
			}
		}
	}
	Messenger.instance.Listen ("lerp_time", this);
}

function SetLayer (l : int) {
	gameObject.layer = l;
	for (var child : Transform in myTransform) {
		child.gameObject.layer = l;
		for (var child2 : Transform in child) {
			child2.gameObject.layer = l;
		}
	}
}

function Update () {
	myTransform.Rotate (Vector3.up * speed * timeScale * Time.deltaTime);
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

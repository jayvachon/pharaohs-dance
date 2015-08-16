#pragma strict

private var rotateSpeed : float = 160;
private var myTransform : Transform;
private var timeScale : float = 1.0;

function Awake () {
	myTransform = transform;
}

function Start () {
	
	var c : Color[] = [ CustomColor.black, CustomColor.yellow ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
	
	Messenger.instance.Listen ("lerp_time", this);
	
}

function Update () {
	
	myTransform.Rotate (Vector3.right * rotateSpeed * Time.deltaTime * timeScale);
			
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}
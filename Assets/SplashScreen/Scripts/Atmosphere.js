#pragma strict

var parent : Transform;
var planet : GameObject;
private var planetAnim : Animation;

private var startScale : Vector3;

function Awake () {
	
	startScale = transform.localScale;
	
	planetAnim = planet.GetComponent(Animation);
	
	//Invoke("FaceCamera", planetAnim.clip.length);
	
}

function FaceCamera () {
	//transform.localRotation.z = 0.0;
}

function Update () {
	//transform.localScale.x = startScale.x * parent.localScale.x;
	//transform.localScale.z = startScale.z * parent.localScale.z;
}
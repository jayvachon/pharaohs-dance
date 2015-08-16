#pragma strict
#pragma downcast

var particles : GameObject;
var speed : float = 7.0;
var center : Transform;
private var myTransform : Transform;
private var reset : boolean = false;

private var timeScale : float = 1.0;
private var startScale : Vector3;

private var myColor : Color;
private var child : Transform;

@HideInInspector
var rotationAxis : Vector3;

private var flip : boolean = true; 	// The collected reverser should not flip (by moving to the new position, it effectively is flipped)

function Awake () {
	myTransform = transform;
}

function Start () {
	myColor = CustomColor.blue;
	
	SetLayer();
	EnableProjector();
	
	child = transform.GetChild(0);
	var c : Color[] = [ CustomColor.black, myColor ];
	child.renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	child.gameObject.layer = gameObject.layer;
	
	startScale = myTransform.localScale;
	
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("reverse_wheel", this);	
	Messenger.instance.Listen("restart_game", this);
	
	speed = Wheel.speed;
	StartCoroutine(RotateReverser());
}

function SetLayer () {
	var radius : float = Vector3.Distance(myTransform.position, Vector3.zero);
	var row : int = Mathf.RoundToInt(radius / Wheel.radius) - 1;
	if (row <= 18)
		gameObject.layer = (row + 10);
	else
		gameObject.layer = (row - 18) + 10;
}

function EnableProjector () {
	for (var child : Transform in myTransform) {
		if (child.name == "Shadow") {
			child.GetComponent(BlobShadow).OnEnable();
		}
	}
}

/*function Update () {
	myTransform.Rotate(Vector3.right * 100 * Time.deltaTime * timeScale);
}*/

function RotateReverser () {
	while (Application.isPlaying) {
		myTransform.Rotate(Vector3.right * 100 * Time.deltaTime * timeScale);
		yield WaitForFixedUpdate();
	}
}

function OnViewEnter () {
	child.renderer.enabled = true;
	collider.enabled = true;
}

function OnViewExit () {
	child.renderer.enabled = false;
	collider.enabled = false;
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Player") {
		StopCoroutine("MoveToPlayer");
		
		new MessageCollectReverser();
		
		yield StartCoroutine(Expand(0.05));
		var part : GameObject = ObjectBase.instance.Instantiate(particles, myTransform.position);
		part.GetComponent(ParticleSystem).startColor = myColor;
		
		StartCoroutine(ReverseWheel());
		ResetPosition();
	}
	if (other.tag == "Net" && !reset) {
		StartCoroutine(MoveToPlayer());
	}
}

function Expand (time : float) {
	
	var elapsedTime = 0.0;
	var endScale : Vector3 = startScale * 2.5;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		myTransform.localScale = Vector3.Slerp(startScale, endScale, (elapsedTime / time));
		yield;
	}
	
	myTransform.localScale = startScale;
}

function MoveToPlayer () {
	var p = GameObject.FindGameObjectWithTag("Player");	
	while (myTransform.position != p.transform.position && !reset) {
		myTransform.position = Vector3.Lerp(myTransform.position, p.transform.position, Time.deltaTime * 15.0);
		yield;
	}
}

function ResetPosition () {
	reset = true;
	myTransform.position.y *= -1;
	myTransform.position.z *= -1;
	myTransform.position.x = 0;
	myTransform.localScale = startScale;
	yield WaitForSeconds(1.0);
	reset = false;
}

function ReverseWheel () {
	
	var tMax : float = 1.0;
	var t : float = tMax;
	var tRate : float = 0.01;
	
	while (t > 0.0) {
		t -= tRate;
		TimeController.reverserTimeScale = t;
		new MessageLerpTime();
		yield;
	}
	
	flip = false;
	new MessageReverseWheel();
	
	while (t < tMax) {
		t += tRate;
		TimeController.reverserTimeScale = t;
		new MessageLerpTime();
		yield;
	}
	
}

function _ReverseWheel () {
	if (flip)
		Flip(0.5);
	else
		flip = true;
}

function Flip (time : float) {
	var elapsedTime : float = 0.0;
	var start : float = myTransform.GetChild(0).transform.localEulerAngles.z;
	var end : float = myTransform.GetChild(0).transform.localEulerAngles.z - 180;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		myTransform.GetChild(0).transform.localEulerAngles.z = Mathf.Lerp(start, end, elapsedTime / time);
		yield;
	}
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

function _RestartGame () {
	yield WaitForFixedUpdate();
	myTransform.position.x = 0.0;
}
#pragma strict
#pragma downcast

var particles : GameObject;
var speed : float = 4.0;
private var playerTransform : Transform;

private var myTransform : Transform;
private var startScale : Vector3;
private var shadow : BlobShadow;
private var boxRender : Transform;
private var boxRenderScript : BoxRender;
private var bow : Transform;
private var bowScript : Bow;

private var timeScale : float;

function Awake () {

	myTransform = transform;
	
}

function Start () {
	
	SetListens();
	FindPlayer();
	SetStartScale();
	SetChildren();
	SetLayer();
	SetColor();
	EnableShadow();
	SetSpeed();
	
}

// ---------- ---------- ---------- ---------- ---------- Setup ---------- ---------- ---------- ---------- ----------//

function SetListens () {
	Messenger.instance.Listen("lerp_time", this);
}

function FindPlayer() {
	var p = GameObject.FindGameObjectWithTag("Player");
	playerTransform = p.transform;
}

function SetStartScale () {
	startScale = myTransform.localScale;
}

function SetChildren () {
	for (var child : Transform in transform) {
		if (child.name == "BoxRender") {
			boxRender = child;
			boxRenderScript = boxRender.GetComponent(BoxRender);
			for (var c2 : Transform in child) {
				if (c2.name == "Bow") {
					bow = c2;
					bowScript = bow.GetComponent (Bow);
				}
			}
		}
		if (child.name == "Shadow") {
			shadow = child.GetComponent(BlobShadow);
		}
	}
}

function SetLayer () {
	var radius : float = Vector3.Distance(myTransform.position, Vector3.zero);
	var row : int = Mathf.RoundToInt(radius / Wheel.radius) - 1;
	if (row <= 18)
		gameObject.layer = (row + 10);
	else
		gameObject.layer = (row - 18) + 10;
		
	boxRender.gameObject.layer = gameObject.layer;
	bow.gameObject.layer = gameObject.layer;
	bowScript.SetLayer (gameObject.layer);
}

function SetColor () {
	var c : Color[] = [ CustomColor.red, CustomColor.white ];
	boxRender.renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
}

function EnableShadow () {
	shadow.OnEnable();
}

function SetSpeed () {
	speed = Wheel.speed;
}

function EnableCollider () {
	collider.enabled = true;
}

function DisableCollider () {
	collider.enabled = false;
}

function EnableRenderer() {
	boxRender.renderer.enabled = true;
}

function DisableRenderer() {
	boxRender.renderer.enabled = false;
}

function UpdateTimeScale () {
	timeScale = TimeController.timeScale;
}

function OnViewEnter () {
	EnableRenderer();
	EnableCollider();
}

function OnViewExit () {
	DisableRenderer();
	DisableCollider();
}

function OnTriggerEnter (other : Collider) {

	if (other.tag == "Player") {
	
		StopCoroutine("MoveToPlayer");		
		yield StartCoroutine("Expand", 0.05);
		
		new MessageCollectAirbonus();
		
		CreateParticles(CustomColor.red);
		FlipPosition();
		ResetScale();
		
	}
	
	if (other.tag == "Net") {
		StartCoroutine("MoveToPlayer");
	}
	
}

function CreateParticles (color : Color) {
	var part : GameObject = ObjectBase.instance.Instantiate(particles, myTransform.position);
	part.GetComponent(ParticleSystem).startColor = color;
}

function FlipPosition () {

	myTransform.position.y *= -1;
	myTransform.position.z *= -1;
	
}

function ResetScale () {
	myTransform.localScale = startScale;
}

// ---------- ---------- ---------- ---------- ---------- Animation ---------- ---------- ---------- ---------- ----------//

function MoveToPlayer () {
	
	var attractSpeed : float = 15.0;
	
	while (myTransform.position != playerTransform.position) {
		myTransform.position = Vector3.Lerp(myTransform.position, playerTransform.position, Time.deltaTime * attractSpeed);
		yield;
	}
	
}

function Expand (time : float) {
	
	var eTime = 0.0;
	var endScale : Vector3 = startScale * 2.5;
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		myTransform.localScale = Vector3.Slerp(startScale, endScale, (eTime / time));
		yield;
	}
	
	myTransform.localScale = startScale;
	
}

// ---------- ---------- ---------- ---------- ---------- Messages ---------- ---------- ---------- ---------- ----------//

function _LerpTime () {
	boxRenderScript.timeScale = TimeController.timeScale;
}
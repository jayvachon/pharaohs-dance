#pragma strict

var particles : GameObject;

private var myTransform : Transform;
private var fullScale : Vector3;

private var timeScale : float = 1.0;
private var rotateSpeed : float = 100.0;

private var platform : Platform;

@HideInInspector
var myColor : Color;

private var type : int;

private var player : Transform;

private var shadow : BlobShadow;

function Awake () {
	myTransform = transform;
	fullScale = myTransform.localScale;
	shadow = transform.GetChild(0).GetComponent(BlobShadow);
}

function Start () {
	
	player = GameObject.FindGameObjectWithTag("Player").transform;
	
	//var c : Color[] = [ CustomColor.black, CustomColor.white ];
	//renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("restart_game", this);
}

function OnEnable () {
	//CreateDonut();
	StartCoroutine(RotateDonut());
}

function CreateDonut (p : Platform) {
	myTransform.localScale = Vector3.zero;
	collider.enabled = true;
	timeScale = TimeController.timeScale;
	SetType();
	ColorDonut();
	platform = p;
	Inventory.instance.AddDonut();
	animation.Play("DonutGrow");
	EnableProjector();
}

function CreateDonut (t : int, p : Platform) {
	collider.enabled = true;
	timeScale = TimeController.timeScale;
	type = t;
	ColorDonut();
	platform = p;
	//Inventory.instance.AddDonut();
	EnableProjector();
}

function EnableProjector () {
	yield WaitForSeconds(animation["DonutGrow"].length / 2.0);
	shadow.OnEnable();
}

function OnDisable () {
	shadow.OnDisable();
}

function ColorDonut () {
	myColor = CustomColor.colorProgression[type];
	var c : Color[] = [ CustomColor.black, myColor ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
}

function SetType () {
	type = Inventory.instance.GetDonutCount() + 1;
}

function SetType (t : int, p : Platform) {
	type = t;
	ColorDonut ();
	platform = p;
}

function SetPlatform () {
	while (myTransform.parent == null) {
		yield;
	}
	platform = transform.parent.GetComponent(Platform);
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Player") {
					
		yield StartCoroutine(Expand(0.05));
		
		var part : GameObject = ObjectBase.instance.Instantiate(particles, myTransform.position);
		part.GetComponent(ParticleSystem).startColor = myColor;
		
		Inventory.instance.SetLastCollectedDonut(type);//(type - 1);
		new MessageCollectDonut();
		
		//if (myTransform.parent.tag == "Platform") {
			platform.DestroyDonut();
		//} 
	}
	if (other.tag == "Net" && gameObject.activeSelf) {
		StartCoroutine(MoveToPlayer());
	}
}

function Expand (time : float) {
	
	var elapsedTime = 0.0;
	var startScale : Vector3 = myTransform.localScale;
	var endScale : Vector3 = myTransform.localScale * 2.5;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		myTransform.localScale = Vector3.Slerp(startScale, endScale, (elapsedTime / time));
		yield;
	}
	
	myTransform.localScale = startScale;
	
}

function MoveToPlayer () {
	while (myTransform.position != player.position) {
		myTransform.position = Vector3.Lerp(myTransform.position, player.position, Time.deltaTime * 15.0);
		yield;
	}
}

function Update () {
	myTransform.Rotate(Vector3.forward * rotateSpeed * Time.deltaTime * timeScale);
	myTransform.Rotate(Vector3.up * rotateSpeed * Time.deltaTime * timeScale);
}

function RotateDonut () {
	while (Application.isPlaying) {
		myTransform.Rotate(Vector3.forward * rotateSpeed * Time.deltaTime * timeScale);
		myTransform.Rotate(Vector3.up * rotateSpeed * Time.deltaTime * timeScale);
		yield WaitForFixedUpdate();
	}
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

function _RestartGame () {
	if (myTransform.parent.tag == "Platform") {
		platform.DestroyDonut();
	}
}
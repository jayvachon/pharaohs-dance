#pragma strict

var particles : GameObject;

private var myTransform : Transform;
private var degrees : float = 0.0;
private var fullScale : Vector3;
private var scalePercent : float;

private var timeController : TimeController;
private var type : int;							// type matches platform's type

private var timeScale : float = 1.0;
private var platform : Platform;
private var shadow : BlobShadow;

@HideInInspector
var myColor : Color;

function Awake () {
	myTransform = transform;
	fullScale = myTransform.localScale;
	
	shadow = transform.GetChild(0).GetComponent(BlobShadow);
}

function Start () {
	timeController = GameObject.Find("TimeController").GetComponent(TimeController);
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("restart_game", this);
}

function OnEnable () {
	myTransform.localScale = Vector3.zero;
	timeScale = TimeController.timeScale;
	animation["PillPulse"].speed = timeScale;
	degrees = 0.0;
	ColorPill();
	animation.Play("PillGrow");
	animation.PlayQueued("PillPulse", QueueMode.CompleteOthers);
	collider.enabled = true;
	
	EnableProjector();
}

function EnableProjector () {
	yield WaitForSeconds(animation["PillGrow"].length / 2.0);
	shadow.OnEnable();
}

function OnDisable () {
	shadow.OnDisable();
}

function ColorPill () {

	if (myTransform.position != ObjectBase.instance.transform.position) {
		// Wait until we've found our platform parent
		while (transform.parent == null) {
			yield;
		}
		
		if (myTransform.parent.tag == "Platform") {
			platform = myTransform.parent.GetComponent(Platform);
			type = platform.bonusType;
			myColor = platform.myColor;
			
			//renderer.material.color = myColor;
			renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(myColor);
		} else if (myTransform.parent.tag == "CoinTrail") {
			var ct = myTransform.parent.GetComponent(CoinTrail);
			type = ct.crystalType;
			myColor = ct.crystalColor;
			//renderer.material.color = myColor;
			renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(myColor);
		}
	}
}

function Grow (time : float) {
	scalePercent = 0.0;
	while (scalePercent < 1.0) {
		scalePercent = Mathf.Lerp(scalePercent, 1.0, 0.1);
		yield;
	}
	/*var elapsedTime = 0.0;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		myTransform.localScale = Vector3.Lerp(myTransform.localScale, fullScale, (elapsedTime / time));
		yield;
	}*/
}

function OnTriggerEnter (other : Collider) {	
	if (other.tag == "Player") {
		
		SendCollectMessage(type);
		
		animation.Stop("PillPulse");
		yield StartCoroutine(Expand(0.05));
		
		var part : GameObject = ObjectBase.instance.Instantiate(particles, myTransform.position);
		part.GetComponent(ParticleSystem).startColor = myColor;
		
		timeController.AddToTimeScale(type);
		if (myTransform.parent.tag == "Platform") {
			platform.DestroyPill();
		} else if (myTransform.parent.tag == "CoinTrail") {
			myTransform.parent.GetComponent(CoinTrail).SubtractObjectCount(); 
			ObjectBase.instance.Destroy(this.gameObject);
		}
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
	var p = GameObject.FindGameObjectWithTag("Player");	
	while (myTransform.position != p.transform.position) {
		myTransform.position = Vector3.Lerp(myTransform.position, p.transform.position, Time.deltaTime * 15.0);
		yield;
	}
}

function Pulse (speed : float) {
	degrees += speed;
	var scale : float = Mathf.Lerp(fullScale.x, fullScale.x * 2.0, Mathf.Abs(Mathf.Sin(degrees)));
	myTransform.localScale = Vector3(scale * scalePercent, scale * scalePercent, scale * scalePercent);
}

function SendCollectMessage (t : int) {

	new MessageCollectPill();
	switch (t) {
		case 1 : new MessageCollectPill1(); break;
		case 2 : new MessageCollectPill2(); break;
		case 3 : new MessageCollectPill3(); break;
		case 4 : new MessageCollectPill4(); break;
		case 5 : new MessageCollectPill5(); break;
		case 6 : new MessageCollectPill6(); break;
		case 7 : new MessageCollectPill7(); break;
	}
	
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
	animation["PillPulse"].speed = timeScale;
}

function _RestartGame () {
	if (myTransform.parent.tag == "Platform") {
		platform.DestroyPill();
	}
}
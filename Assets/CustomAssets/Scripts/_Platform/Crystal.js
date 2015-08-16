#pragma strict

var particles : GameObject;

private var myTransform : Transform;
private var fullScale : Vector3;
private var scalePercent : float;

private var type : int;							// type matches platform's type

private var timeScale : float = 1.0;
private var platform : Platform;

private var rotateSpeed : int;

private var shadow : BlobShadow;

var bonus : boolean = false;					// if true, it's the crystal on the bonus platform
var bonusValue : int = 10000;

@HideInInspector
var myColor : Color;

function Awake () {
	myTransform = transform;
	fullScale = myTransform.localScale;
	rotateSpeed = Random.Range(120, 200);
	
	shadow = transform.GetChild(0).GetComponent(BlobShadow);
}

function Start () {
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("restart_game", this);
}

/*function Update () {
	myTransform.Rotate(Vector3.forward * rotateSpeed * Time.deltaTime * timeScale);
	myTransform.Rotate(Vector3.up * rotateSpeed * Time.deltaTime * timeScale);
}*/

function RotateCollectible () {
	while (Application.isPlaying) {
		myTransform.Rotate(Vector3.forward * rotateSpeed * Time.deltaTime * timeScale);
		myTransform.Rotate(Vector3.up * rotateSpeed * Time.deltaTime * timeScale);
		yield WaitForFixedUpdate();
	}
}

function OnEnable () {
	myTransform.localScale = Vector3.zero;
	collider.enabled = true;
	timeScale = TimeController.timeScale;
	ColorCrystal();
	animation.Play("CrystalGrow");
	
	EnableProjector();
	StartCoroutine(RotateCollectible());
}

function EnableProjector () {
	yield WaitForSeconds(animation["CrystalGrow"].length / 2.0);
	shadow.OnEnable();
}

function OnDisable () {
	shadow.OnDisable();
}

function SetBonus (b : boolean) {
	bonus = b;
	ColorCrystal ();
}

function ColorCrystal () {

	if (myTransform.position != ObjectBase.instance.transform.position) {
		
		if (bonus) {
			type = 0;
			myColor = CustomColor.colorProgression[0];
			renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(myColor);
			return;
		}
		
		// Wait until we've found our platform parent
		while (myTransform.parent == null) {
			yield;
		}
		
		if (myTransform.parent.tag == "Platform") {
			platform = transform.parent.GetComponent(Platform);
 			type = platform.bonusType;
 			
			myColor = platform.myColor;
			//renderer.material.color = myColor;
			renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(myColor);
		}
		
		if (myTransform.parent.tag == "CoinTrail") {
			var ct = myTransform.parent.GetComponent(CoinTrail);
			type = ct.crystalType;
			myColor = ct.crystalColor;
			//renderer.material.color = myColor;
			renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(myColor);
		}
	}
}

function OnTriggerEnter (other : Collider) {	
	if (!Inventory.instance.IsStomachFull()) {
		if (other.tag == "Player") {
					
			//animation.Stop("PillPulse");
			yield StartCoroutine(Expand(0.05));
			
			var part : GameObject = ObjectBase.instance.Instantiate(particles, myTransform.position);
			part.GetComponent(ParticleSystem).startColor = myColor;
			
			SendCollectMessage(type);
			
			if (bonus) {
				Score.instance.AddScore(50000);
				bonus = false;
				ObjectBase.instance.Destroy(this.gameObject);
				return;
			}
			
			new MessageAddCrystal();
			
			if (myTransform.parent.tag == "Platform") {
				platform.DestroyCrystal();
			} else if (myTransform.parent.tag == "CoinTrail") {
				myTransform.parent.GetComponent(CoinTrail).SubtractObjectCount(); 
				ObjectBase.instance.Destroy(this.gameObject);
			} 
		}
		if (other.tag == "Net" && gameObject.activeSelf) {
			StartCoroutine(MoveToPlayer());
		}
	}
}

function Expand (time : float) {
	
	var elapsedTime = 0.0;
	var startScale : Vector3 = myTransform.localScale;
	var endScale : Vector3 = myTransform.localScale * 2.5;
	
	if (bonus)
		endScale *= 10;
	
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

function SendCollectMessage (t : int) {

	new MessageCollectCrystal();
	switch (t) {
		case 0 : new MessageCollectCrystal0(); break;
		case 1 : new MessageCollectCrystal1(); break;
		case 2 : new MessageCollectCrystal2(); break;
		case 3 : new MessageCollectCrystal3(); break;
		case 4 : new MessageCollectCrystal4(); break;
		case 5 : new MessageCollectCrystal5(); break;
		case 6 : new MessageCollectCrystal6(); break;
		case 7 : new MessageCollectCrystal7(); break;
	}
	
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

function _RestartGame () {
	if (bonus) {
		ObjectBase.instance.Destroy(this.gameObject);
		return;
	}
	if (myTransform.parent.tag == "Platform") {
		platform.DestroyCrystal();
	}
}
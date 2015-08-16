#pragma strict
#pragma downcast

var sound : AudioClip;
var particle : GameObject;
private var myTransform : Transform;
private var fullScale;
private var timeScale : float = 1.0;

@HideInInspector
var startPosition : Vector3;			// Relative position to parent, set by the parent

private var rotateSpeed : int;

private var player : Transform;

private var shadow : BlobShadow;

function Awake () {
	myTransform = transform;
	fullScale = myTransform.localScale;
	rotateSpeed = Random.Range(120, 200);
	
	var c : Color[] = [ CustomColor.black, CustomColor.yellow ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
	
	shadow = transform.GetChild(0).GetComponent(BlobShadow);
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("restart_game", this);
}

/*function Update () {
	RotateCollectible();
}*/

function OnEnable () {
	StartCoroutine(SetRandomRotation());
	myTransform.localScale = Vector3.zero;
	animation.Play("CoinGrow");
	timeScale = TimeController.timeScale;
	collider.enabled = true;
	EnableProjector();
	StartCoroutine(RotateCollectible());
}

function EnableProjector () {
	yield WaitForSeconds(animation["CoinGrow"].length / 2.0);
	shadow.OnEnable();
}

function SetRandomRotation () {
	while (myTransform.parent == null) {
		yield;
	}
	myTransform.localRotation = Random.rotation;
}

function OnDisable () {
	shadow.OnDisable();
}

function Grow () {
	while (myTransform.localScale != fullScale) {
		myTransform.localScale = Vector3.Slerp(myTransform.localScale, fullScale, Time.deltaTime * 12.5);
		yield;
	}
}

function RotateCollectible () {
	while (Application.isPlaying) {
		myTransform.Rotate(Vector3.forward * rotateSpeed * Time.deltaTime * timeScale);
		myTransform.Rotate(Vector3.up * rotateSpeed * Time.deltaTime * timeScale);
		yield WaitForFixedUpdate();
	}
}

function OnTriggerEnter (other : Collider) {	
	if (other.tag == "Player") {
		StopCoroutine("MoveToPlayer");
		new MessageCollectCoin();
		StartCoroutine(PlaySound());
		
		// Special function for destroying a coin on a platform
		if (transform.parent.tag == "Platform") {
			yield StartCoroutine(Expand(0.05));
			ObjectBase.instance.Instantiate(particle, myTransform.position);
			var platform : Platform = transform.parent.GetComponent(Platform);
			platform.DestroyCoin(startPosition);
		} else {
			if (transform.parent.tag == "CoinTrail") {
				transform.parent.GetComponent(CoinTrail).SubtractObjectCount(); 
			}
			yield StartCoroutine(Expand(0.05));
			ObjectBase.instance.Instantiate(particle, myTransform.position);
			ObjectBase.instance.Destroy(this.gameObject);
		}
	}
	if (other.tag == "Net" && gameObject.activeSelf) {
		StartCoroutine("MoveToPlayer");
	}
}

function Expand (time : float) {
	
	var elapsedTime = 0.0;
	var startScale : Vector3 = myTransform.localScale;
	var endScale : Vector3 = myTransform.localScale * Random.Range(2.0, 4.0);
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		myTransform.localScale = Vector3.Slerp(startScale, endScale, (elapsedTime / time));
		yield;
	}
	
	// In case it wasn't collected
	myTransform.localScale = startScale;
	
}

function ExpandAndDestroy (time : float) {
	
	var elapsedTime = 0.0;
	var startScale : Vector3 = myTransform.localScale;
	var endScale : Vector3 = myTransform.localScale * 2.5;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		myTransform.localScale = Vector3.Slerp(startScale, endScale, (elapsedTime / time));
		yield;
	}
	
	var platform : Platform = transform.parent.GetComponent(Platform);
	platform.DestroyCoin(startPosition);
	
}

function PlaySound () {
	while (!audio.isPlaying) {
		//audio.PlayOneShot(sound);
		yield;
	}
}

function MoveToPlayer () {
	//var p = GameObject.FindGameObjectWithTag("Player");	
	while (myTransform.position != player.position) {
		myTransform.position = Vector3.Lerp(myTransform.position, player.position, Time.deltaTime * 15.0);
		yield;
	}
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}

function _RestartGame () {
	if (transform.parent.tag == "Platform") {
		var platform : Platform = transform.parent.GetComponent(Platform);
		platform.DestroyCoin(startPosition);
	}
}
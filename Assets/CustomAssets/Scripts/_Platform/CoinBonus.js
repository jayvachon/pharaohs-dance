#pragma strict

@HideInInspector
var center : Transform;
private var angle : float;
var particles : GameObject;
private var endPosition : Vector3;
private var distance : float = 14.0;	// Distance to move away from start position

private var myTransform : Transform;
private var player : Transform;

function Awake () {
	myTransform = transform;
	collider.enabled = false;
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;	
}

function OnEnable () {

	if (myTransform.position != ObjectBase.instance.transform.position) {
		angle = Mathf.Atan2(center.position.y - myTransform.position.y, myTransform.position.z - center.position.z);
		angle = Mathf.Deg2Rad * ((angle * Mathf.Rad2Deg) + 90.0);
		var centerDistance : float = Vector3.Distance(myTransform.position, center.position);		
		endPosition.y = center.position.y + ((centerDistance + distance) * Mathf.Cos(angle)); //((centerDistance + distance) * Mathf.Cos(angle));
		endPosition.z = center.position.z + ((centerDistance + distance) * Mathf.Sin(angle)); //((centerDistance + distance) * Mathf.Sin(angle));
		StartCoroutine(MoveToPosition(0.5));
	}
	
}

function OnDisable () {
	collider.enabled = false;
}

function Update () {
	myTransform.Rotate(Vector3.right * 100 * TimeController.timeScale * Time.deltaTime);
}

function OnTriggerEnter (other : Collider) {	
	if (other.tag == "Net") {
		StartCoroutine(MoveToPlayer());
	}
	if (other.tag == "Player") {
		new MessageCollectBonus();
		
		var part : GameObject = ObjectBase.instance.Instantiate(particles, myTransform.position);
		part.GetComponent(ParticleSystem).startColor = renderer.materials[1].color;
		
		ObjectBase.instance.Destroy(this.gameObject);
	}
}

function MoveToPlayer () {
	
	while (myTransform.position != player.transform.position) {
		myTransform.position = Vector3.Lerp(myTransform.position, player.transform.position, Time.deltaTime * 15.0);
		yield;
	}
}

function MoveToPosition (time : float) {
	var elapsedTime : float = 0.0;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		myTransform.position = Vector3.Lerp(myTransform.position, endPosition, (elapsedTime / time));
		yield;
	}
	collider.enabled = true;
}

function VectorsApproximately (v1 : Vector3, v2 : Vector3, dif : float) {
	if ((v1 - v2).sqrMagnitude <= (v1 * dif).sqrMagnitude)
		return true;
	else
		return false;
}

function AngleSigned (v1 : Vector3, v2 : Vector3, n : Vector3) {
	return Mathf.Atan2(
		Vector3.Dot(n, Vector3.Cross(v1, v2)),
		Vector3.Dot(v1, v2)) * Mathf.Rad2Deg;
}
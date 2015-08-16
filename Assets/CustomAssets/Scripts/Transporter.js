#pragma strict

private var startPosition : Vector3;
private var endPosition : Vector3;
private var myTransform : Transform;
private var player : Transform;
private var diameter : float;
private var sphere : Transform;

@HideInInspector
var center : Transform;

@HideInInspector
var nextCenter : Transform;

function Awake () {
	myTransform = transform;
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
	startPosition = myTransform.position;
	endPosition = myTransform.position;
	endPosition.x -= 200;
	
	sphere = myTransform.GetChild(0);
	var mesh : Mesh = sphere.GetComponent(MeshFilter).mesh;
	diameter = mesh.bounds.size.x * 0.75;
	//StartCoroutine(MoveToWheel(startPosition, endPosition, 30.0));
}

function Update () {
	if (Input.GetButtonDown("Jump")) {
		if (PlayerInTransporter()) {
			StartTransporting();
		}
	}
}

function StartTransporting () {
	//MainCamera.fixedUpdate = false;
	//player.parent = myTransform;
	
	yield StartCoroutine(HoldPlayer(0.5));
	var endPos : Vector3 = Vector3(nextCenter.position.x, nextCenter.position.y + 17.0, nextCenter.position.z);
	MoveToWheel(myTransform.position, endPos, 30.0);
	
	
}

function HoldPlayer (time : float) {
	var elapsedTime : float = 0.0;
	var startPosition : Vector3 = player.position;
	var endPosition : Vector3 = sphere.position;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		player.position = Vector3.Lerp(startPosition, endPosition, elapsedTime / time);
		yield;
	}
}

function MoveToWheel (start : Vector3, end : Vector3, speed : float) {
	//yield WaitForSeconds(2.0);
	
	new MessageTransportPlayer();
	//new MessageStopDeactivating();
	myTransform.parent = null;
	
	MainCamera.fixedUpdate = false;
	//MainCamera.instance.distance *= 2;
	//MainCamera.instance.height *= 2;
	
	var startCamDis : float = MainCamera.instance.distance;
	var startCamHeight : float = MainCamera.instance.height;
	var endCamDis : float = startCamDis * 6;
	var endCamHeight : float = startCamHeight * 3;
	
	player.parent = myTransform;
	
	var t : float = 0.0;
	var rate = 1.0 / Vector3.Distance(start, end) * speed;
	while (t < 1.0) {
		t += Time.deltaTime * rate;
		myTransform.position = Vector3.Lerp(start, end, Mathf.SmoothStep(0.0, 1.0, t));
		
		if (t < 0.5) {
			MainCamera.instance.distance = Mathf.Lerp(startCamDis, endCamDis, Mathf.SmoothStep(0.0, 0.5, t));
			MainCamera.instance.height = Mathf.Lerp(startCamHeight, endCamHeight, Mathf.SmoothStep(0.0, 0.5, t));
		} else {
			MainCamera.instance.distance = Mathf.Lerp(endCamDis, startCamDis, Mathf.SmoothStep(0.5, 1.0, t));
			MainCamera.instance.height = Mathf.Lerp(endCamHeight, startCamHeight, Mathf.SmoothStep(0.5, 1.0, t));
		}
		
		player.position = sphere.position;
		yield;
	}
	
	//MainCamera.instance.distance /= 2;
	//MainCamera.instance.height /= 2;
	MainCamera.fixedUpdate = true;
	player.parent = null;
	
	new MessageTransportEnd();
	//new MessageResumeDeactivating();
}

function PlayerInTransporter () {
	return (Vector3.Distance(sphere.position, player.position) <= diameter);
}
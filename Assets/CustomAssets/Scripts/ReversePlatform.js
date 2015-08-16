#pragma strict

private var myTransform : Transform;
private var fullScale : float;
@HideInInspector
var center : Transform;

@HideInInspector
var speed : float;

private var timeScale : float = 1.0;
private var inView : boolean;
private var player : Transform;

private var myColor : Color;
private var shader1 : Shader;
private var shader2 : Shader;
private var transparent : Color;

function Awake () {
	myTransform = transform;
	fullScale = myTransform.localScale.x;
	myTransform.localScale.x = 0.00001;
	myTransform.localScale.z = 0.00001;
	
	myColor = CustomColor.violet;
	transparent = Color(myColor.r, myColor.g, myColor.b, 0.75);
	shader1 = Shader.Find("Diffuse");
	shader2 = Shader.Find("Transparent/Diffuse");
	
	renderer.materials[0].color = CustomColor.black;
	renderer.materials[1].shader = shader1;
	renderer.materials[1].color = myColor;
	
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
	Messenger.instance.Listen("lerp_time", this);
}

function Update () {
	if (inView) {
		if (player.position.y > myTransform.position.y)
			renderer.materials[1].shader = shader1;
		else
			renderer.materials[1].shader = shader2;
	}
}

function OnEnable () {
	InitializeQualities();
}

function OnDisable () {
	myTransform.localScale.x = 0.00001;
	myTransform.localScale.z = 0.00001;
}

function InitializeQualities () {
	while (myTransform.parent == null) {
		yield;
	}
	LoopAround(1.5 * timeScale);
	Grow(2.0 * timeScale);
}

function LoopAround (time : float) {
	
	var elapsedTime : float = 0.0;
	var startPosition : float = myTransform.position.x;
	var endPosition : float = myTransform.parent.transform.position.x + 10;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;		
		myTransform.position.z = myTransform.parent.transform.position.z + (10 * Wheel.direction) * Mathf.Sin(180 * (elapsedTime / time) * Mathf.Deg2Rad);
		myTransform.position.x = Mathf.Lerp(startPosition, endPosition, (elapsedTime / time));
		yield;
	}
	
	myTransform.parent = null;
	
}

function FixedUpdate () {
	myTransform.RotateAround(center.position, Vector3(Wheel.direction * -1, 0, 0), speed * Time.deltaTime * timeScale);
	//myTransform.RotateAround(center.position, Vector3.Scale(Vector3(Wheel.direction * -1, Wheel.direction * -1, Wheel.direction * -1), center.transform.eulerAngles), speed * Time.deltaTime * timeScale);
}

function Grow (time : float) {
	var elapsedTime : float = 0.0;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		myTransform.localScale.x = Mathf.Lerp(0.00001, fullScale, (elapsedTime / time));
		myTransform.localScale.z = Mathf.Lerp(0.00001, fullScale, (elapsedTime / time));
		yield;
	}
}

function OnViewEnter () {
	renderer.enabled = true;
	collider.enabled = true;
	inView = true;
}

function OnViewExit () {
	renderer.enabled = false;
	collider.enabled = false;
	inView = false;
}

function _LerpTime () {
	timeScale = TimeController.timeScale;
}
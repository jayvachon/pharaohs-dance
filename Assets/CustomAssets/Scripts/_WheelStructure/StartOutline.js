#pragma strict
#pragma downcast

private var glow : boolean[] = new boolean[4];
private var color : Color[] = new Color[4];

private var player : Transform;

@HideInInspector
var center : Transform;

private var startScale : Vector3;
private var smallScale : Vector3;
private var small : boolean = false;

private var myTransform : Transform;

function Awake () {
	myTransform = transform;
}

function Start () {

	player = GameObject.FindGameObjectWithTag("Player").transform;
	startScale = myTransform.localScale;
	smallScale = startScale;
	smallScale.y /= 2;
	smallScale.z /= 2;
	
	for (var i = 0; i < 4; i ++) {
		glow[i] = false;
		renderer.materials[i].color = CustomColor.black;
	}
	renderer.materials[4].color = CustomColor.white;
	
	color[0] = CustomColor.black;
	color[1] = CustomColor.red;
	color[2] = CustomColor.yellow;
	color[3] = CustomColor.green;
	
	for (var child : Transform in transform) {
		if (child.tag == "Trampoline") {
			child.transform.parent = null;
		}
	}
	
	InvokeRepeating("CheckPlayerPosition", 0.0, 0.5);
	
	Messenger.instance.Listen("restart_game", this);
	
}

function CheckPlayerPosition () {
	if (!small) {
		if (player.position.y < myTransform.position.y && player.position.x <= myTransform.position.x + 6.0) {
			//yield WaitForSeconds(0.5);
			collider.enabled = false;
			//animation.Play("StartPlatformShrink");
			small = true;
		}
	} else {
		if (player.position.y >= myTransform.position.y || player.position.x > myTransform.position.x + 6.0) {
			collider.enabled = true;
			//animation.Play("StartPlatformGrow");
			small = false;
		}
	}
}

/*function Update () {
	if (player.position.y < transform.position.y) {
		collider.enabled = false;
		transform.localScale = smallScale;
	} else {
		collider.enabled = true;
		transform.localScale = startScale;
	}
}*/

function BoxCollided (tag : String) {
	var duration : float = 0.75;
	
	if (tag == "BoxGreen") {
		if (!glow[3])
			StartCoroutine(Glow(duration, 3));
	}
	if (tag == "BoxYellow") {
		if (!glow[2]) 
			StartCoroutine(Glow(duration, 2));
	}
	if (tag == "BoxRed") {
		if (!glow[1])
			StartCoroutine(Glow(duration, 1));
	}
}

function Glow (time : float, mat : int) {
	
	glow[mat] = true;
	var elapsedTime : float = 0.0;
	renderer.materials[mat].color = CustomColor.black;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		renderer.materials[mat].color = Color.Lerp(CustomColor.black, color[mat], elapsedTime / time);
		yield;
	}
	
	elapsedTime = 0.0;
	renderer.materials[mat].color = color[mat];
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		renderer.materials[mat].color = Color.Lerp(color[mat], CustomColor.black, elapsedTime / time);
		yield;
	}	
	glow[mat] = false;
	
}

function _RestartGame () {
	myTransform.localScale = startScale;
}
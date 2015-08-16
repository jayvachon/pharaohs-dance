#pragma strict

private var optionsCount : int;
private var myTransform : Transform;
private var interval : float;

private var snapAngles : float[];
private var position : int = 0;

private var center : int;
private var middle : int;

private var screen : int = 0;
private var screenUp : boolean = true;

function Awake () {
	center = Screen.width / 2;
	middle = Screen.height / 2;
	myTransform = transform;
}

function Start () {
	/*renderer.materials[0].color = CustomColor.black;
	renderer.materials[1].color = CustomColor.yellow;
	renderer.materials[2].color = CustomColor.white;*/
	
	var c : Color[] = [ CustomColor.black, CustomColor.yellow, CustomColor.white ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray(c);
	
	SetSnapAngles();
	
	Messenger.instance.Listen("close_startscreen", this);
	Messenger.instance.Listen("open_startscreen", this);
	
	Rotate(0);
}

function SetSnapAngles () {
	optionsCount = StartScreen.instance.GetOptionsCount();
	interval = 360.0 / (optionsCount + 0.0);
	
	
	snapAngles = new float[optionsCount];
	
	for (var i = 0; i < optionsCount; i ++) {
		snapAngles[i] = i * interval;
	}
	
	ResetPosition();
}

function Update () {
	if (!screenUp) return;
	if (Input.GetButtonDown("Jump") || Input.GetKeyDown (KeyCode.Return)) {
		NewScreen();
	}
	if (Input.GetButtonDown("MenuRight")) {
		AudioManager.PlayElement ("Scroll", new PlaySettings ());
		Rotate(1);
		SetStartScreenSelection(position);
	}
	
	if (Input.GetButtonDown("MenuLeft")) {
		AudioManager.PlayElement ("Scroll", new PlaySettings ());
		Rotate(-1);
		SetStartScreenSelection(position);
	}
	
}

function Reset () {
	var sp : Vector2 = StartScreen.instance.GetSnapPoint(0);
	var sp3 : Vector3 = Vector3(myTransform.position.x, sp.x, sp.y);
	myTransform.LookAt(sp3);
}

function Rotate (direction : int) {
	
	position += direction;
	if (position > optionsCount - 1)
		position = 0;
	if (position < 0) 
		position = optionsCount - 1;
	
	var sp : Vector2 = StartScreen.instance.GetSnapPoint(position);
	var sp3 : Vector3 = Vector3(myTransform.position.x, sp.x, sp.y);
	
	/*var newRotation = Quaternion.LookRotation(Vector3.right, sp3);
	var startRotation = myTransform.rotation;
	
	var time : float = 0.15;
	var elapsedTime : float = 0.0;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		myTransform.rotation = Quaternion.Lerp(startRotation, newRotation, elapsedTime / time);
		yield;
	}*/
	
	myTransform.rotation = Quaternion.LookRotation(Vector3.right, sp3);
	
	// hack hack hack hack
	if (optionsCount <= 2)
		myTransform.localEulerAngles.z -= 90;
	
	//myTransform.LookAt(sp3);
	
	//return position;
}

function SetStartScreenSelection (s : int) {
	StartScreen.instance.SetSelection(s);
}

function NewScreen () {
	if (StartScreen.instance.GetScreen() != screen) {
		SetSnapAngles();
		ResetPosition();
		screen = StartScreen.instance.GetScreen();
	}
}

function ResetPosition () {
	position = 0;
	Rotate(0);
	SetStartScreenSelection(position);
}

function _CloseStartscreen () {
	//renderer.enabled = false;
	//this.gameObject.active = false;
	screenUp = false;
}

function _OpenStartscreen () {
	//renderer.enabled = true;
	screenUp = true;
	SetSnapAngles();
	ResetPosition();
	screen = StartScreen.instance.GetScreen();
}
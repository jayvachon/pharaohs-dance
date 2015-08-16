#pragma strict
#pragma downcast

var color : int;

@HideInInspector
var center : Vector3;

private var myColor : Color;
private var pipe : GameObject;
private var donut : GameObject;

private var donutScript : StepDonut;
private var donutParticleObj : GameObject;
private var donutParticle : DonutParticles;
private var donutParticleActive : boolean = false;

function Start () {

	center = transform.position;
	center.y += 1.5;

	myColor = CustomColor.colorProgression[color + 1];
	
	var c : Color[] = [ CustomColor.black, myColor ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
	
	for (var child : Transform in transform) {
		if (child.name == "StepPipe") {
			pipe = child.gameObject;
		}
		if (child.name == "StepDonut") {
			donut = child.gameObject;
		}
		if (child.name == "DonutParticles") {
			donutParticleObj = child.gameObject;
			donutParticle = child.GetComponent (DonutParticles);
		}
	}
	
	pipe.renderer.materials[2].color = myColor;
	pipe.renderer.materials[2].color.a = 0.0;
	pipe.renderer.materials[1].color = myColor;
	pipe.renderer.materials[1].color.a = 0.0;
	pipe.GetComponent(StepPipe).myStep = color + 1;
	pipe.GetComponent(StepPipe).activated = false;
	
	donut.renderer.materials[1].color = myColor;
	donut.renderer.materials[1].color.a = 0.0;
	donutScript = donut.GetComponent(StepDonut);
	donutScript.myStep = color + 1;
	donutParticle.SetColor (color + 1);
	donutParticleObj.SetActive (false);
	
	
	Messenger.instance.Listen("collect_donut", this);
	Messenger.instance.Listen("restart_game", this);
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
}

function FadeIn () {
	donutScript.FadeIn();
}

function FadeOut () {
	donutScript.FadeOut();
}

function _CollectDonut () {
	if (Inventory.instance.GetLastCollectedDonut() == color + 1) {
		pipe.GetComponent(StepPipe).activated = true;
		donutParticleObj.SetActive (true);
		donutParticleActive = true;
	} else {
		donutParticleObj.SetActive (false);
		donutParticleActive = false;
	}
}

function _RestartGame () {
	pipe.GetComponent(StepPipe).activated = false;
	donutParticleObj.SetActive (false);
	donutParticleActive = false;
}

function _SaveGame () {
	SaveGameManager.SaveBool (color.ToString() + "step_donutParticleActive", donutParticleActive);
}

function _LoadGame () {
	donutParticleActive = SaveGameManager.LoadBool (color.ToString() + "step_donutParticleActive");
	if (donutParticleActive) {
		donutParticleObj.SetActive (true);
	}
}
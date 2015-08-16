#pragma strict

var gotoScene : String = "SplashScreen";

var planetParent : GameObject;
var planet : GameObject;
var atmosphere : GameObject;
var title : GameObject;
var featuring : GameObject;
var starField : GameObject;
var wingsL : GameObject;
var wingsR : GameObject;
var hole : GameObject;

private var planetParentAnim : Animation;
private var planetAnim : Animation;
private var atmosphereAnim : Animation;
private var titleAnim : String;
private var featuringAnim : Animation;
private var wingsLAnim : Animation;
private var wingsRAnim : Animation;
private var holeAnim : Animation;
private var starFieldScript : StarField;


function Awake () {
	Screen.showCursor = false;
}

function Start () {
	
	starField.transform.position.z = 600.0;
	starFieldScript = starField.GetComponent(StarField);
			
	planetParentAnim = planetParent.GetComponent(Animation);
	planetAnim = planet.GetComponent(Animation);
	atmosphereAnim = atmosphere.GetComponent(Animation);
	titleAnim = "TitleBump"; 
	featuringAnim = featuring.GetComponent(Animation);
	wingsLAnim = wingsL.GetComponent(Animation);
	wingsRAnim = wingsR.GetComponent(Animation);
	holeAnim = hole.GetComponent(Animation);
	
	PlayAnimations();
	
}

function PlayAnimations () {
	
	// t = 0.0
	
	yield WaitForSeconds (1.0);
	
	// t = 3.0
	PlayAnimation(planetParentAnim);
	PlayAnimation(planetAnim);
	
	yield WaitForSeconds (3.0);
	
	// t = 6.0
	PlayAnimation(atmosphereAnim);
	
	yield WaitForSeconds(1.5);
	
	// t = 7.5
	featuringAnim.Play();
	
	yield WaitForSeconds(0.25);
	
	// t = 7.75
	title.animation.Play(titleAnim);
	
	yield WaitForSeconds(0.5);
	
	// t = 8.25
	wingsLAnim.Play();
	wingsRAnim.Play();
	
	//yield WaitForSeconds(AnimationLength(wingsLAnim) + 0.5);
	// t = 9.25
	
	yield WaitForSeconds(1.25);
	
	// t = 9.5
	starField.transform.position.z = 100.0;
	starFieldScript.Burst();
	holeAnim.Play();
	
	yield WaitForSeconds(4.0);
	Application.LoadLevel(gotoScene);
	
}

function PlayAnimation (a : Animation) {
	a.Play();
}

function AnimationLength (a : Animation) : float {
	return a.clip.length;
}

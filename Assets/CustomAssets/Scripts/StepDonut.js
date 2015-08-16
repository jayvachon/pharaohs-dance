#pragma strict

@HideInInspector
var myStep : int = 0;

private var interval : int;
//private var height : float;

function Start () {
	renderer.materials[0].color = CustomColor.black;
	renderer.materials[0].color.a = 0.0;
	interval = Mathf.RoundToInt((Wheel.rows + 0.0) / (Wheel.columns + 0.0));
	SetPosition();
}

function SetPosition () {
	
	while (myStep == 0) {
		yield;
	}
	
	var rows : int = (Wheel.rows - Wheel.pipeOnlyRows) + 1 + (myStep * 2);
	//if (myStep == 6)
		//rows ++;
		
	transform.position.y = Wheel.radius * (rows + 1);// - (Wheel.pipeOnlyRows / 6.0));
	/*while (myStep == 0) {
		yield;
	}
	
	var tempStep = Mathf.Max(myStep, 4);	// comment out to have different heights
	
	height = (((tempStep + 0.0) * (interval + 0.0)) * 111.11); //55.555);
	transform.localPosition.y = height;*/
}

function FadeIn () {
	animation["StepDonutFade"].speed = -1;
	animation["StepDonutFade"].time = animation["StepDonutFade"].length;
	animation.Play("StepDonutFade");
}

function FadeOut () {
	animation["StepDonutFade"].speed = 1;
	animation["StepDonutFade"].time = 0.0;
	animation.Play("StepDonutFade");
}
#pragma strict
#pragma downcast

var center : Transform;
private var player : Transform;
private var solid : Color;
private var transparent : Color;
private var shader1 : Shader;
private var shader2 : Shader;

private var yStart : float;
private var inView : boolean = false;

var myColor : Color;
var inScene : boolean = false;

function Start () {

	Messenger.instance.Listen("nearest_center", this);
	
	player = GameObject.FindGameObjectWithTag("Player").transform;
	yStart = transform.position.y - 10.0;
	
	if (inScene) {
		SetColor(CustomColor.red);
	}
}

function SetColor (c : Color) {
	myColor = c;
	solid = myColor;
	transparent = Color(myColor.r, myColor.g, myColor.b, 0.66);
	shader1 = Shader.Find("Diffuse");
	shader2 = Shader.Find("Transparent/Diffuse");
}

function Update () {
	if (inView) {
		if (player.position.y < yStart) {
			renderer.material.shader = shader2;
			renderer.material.color = transparent;
		} else {
			renderer.material.shader = shader1;
			renderer.material.color = solid;
		}
	}
}

function OnViewExit () {
	inView = false;
	//renderer.enabled = false;
	collider.enabled = false;

}

function OnViewEnter () {
	inView = true;
	//renderer.enabled = true;
	collider.enabled = true;
}

function _NearestCenter () {
	if (Wheel.nearestCenter == center) {
		renderer.enabled = true;
		for (var child : Transform in transform) {
			child.renderer.enabled = true;
		}
	} else {
		renderer.enabled = false;
		for (var child : Transform in transform) {
			child.renderer.enabled = false;
		}
	}
}
#pragma strict

private var player : Transform;
private var yStart : float;
private var myTransform : Transform;

private var shader1 : Shader;
private var shader2 : Shader;
private var solid : Color;
private var trans : Color;

function Awake () {
	myTransform = transform;
	yStart = transform.position.y - 10.0;
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
	SetColor();
}

function SetColor () {
	var myColor = CustomColor.yellow;
	solid = myColor;
	trans = myColor;
	trans.a = 0.66;
	shader1 = Shader.Find("Diffuse");
	shader2 = Shader.Find("Transparent/Diffuse");
}

/*function Update () {
	if (player.position.y < yStart) {
		renderer.material.shader = shader2;
		renderer.material.color = trans;
	} else {
		renderer.material.shader = shader1;
		renderer.material.color = solid;
	}
}*/
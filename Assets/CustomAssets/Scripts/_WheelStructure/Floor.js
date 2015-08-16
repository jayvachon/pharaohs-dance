#pragma strict

private var player : Transform;

private var myTransform : Transform;
private var lowestY : float;
private var leave : boolean = false;

private var startPosition : Vector3;

function Awake () {
	myTransform = transform;
	startPosition = myTransform.position;
	lowestY = myTransform.position.y - 5.0;
}

function Start () {
	/*renderer.materials[0].color = CustomColor.black;
	renderer.materials[1].color = CustomColor.dkgrey;
	renderer.materials[2].color = CustomColor.black;*/
	
	Messenger.instance.Listen("restart_game", this);
	
	player = GameObject.FindGameObjectWithTag("Player").transform;
	animation.Play("Hover");
}

/*function Update () {
	if (player.position.y < lowestY && !leave) {
		animation.Play("FloorLeave");
		leave = true;
	} else if (player.position.y >= lowestY + 5 && leave) {
		animation.Play("FloorReturn");
		leave = false;
	}
}*/

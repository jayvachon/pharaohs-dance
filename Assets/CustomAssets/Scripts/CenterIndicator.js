#pragma strict

private var player : Transform;
private var movement : CharacterMotorMovement;
private var controller : CharacterController;
private var transparent = true;
private var minY : float;

function Start () {
	
	player = GameObject.FindGameObjectWithTag("Player").transform;
	controller = player.gameObject.GetComponent(CharacterController);
	movement = player.gameObject.GetComponent(CharacterMotor).movement;
	
	renderer.material.color = CustomColor.white;
	renderer.material.color.a = 0.0;
	
	transform.localScale.y = Wheel.rows * Wheel.radius;
	minY = Wheel.radius * 2.0;
}

function OnTriggerStay (other : Collider) {
	if (other.tag == "Net") {
		FadeIn();
	}
}

function OnTriggerExit (other : Collider) {
	if (other.tag == "Net") {
		FadeOut();
	}
}

function Update () {
	if (!transparent) {
		if (controller.isGrounded) {
			FadeOut();
		}
	}
}

function FadeIn () {
	if (transparent && PlayerFalling() && PlayerInBounds()) {
		animation["IndicatorFade"].speed = -1;
		animation["IndicatorFade"].time = animation["IndicatorFade"].length;
		animation.Play("IndicatorFade");
		transparent = false;
	}
}

function FadeOut () {
	if (!transparent) {
		animation["IndicatorFade"].speed = 1;
		animation["IndicatorFade"].time = 0.0;
		animation.Play("IndicatorFade");
		transparent = true;
	}
}

function PlayerFalling () {
	return (GetVelocityY() < 0.0 || player.position.y < -minY);
}

function GetVelocityY () {
	return movement.velocity.y;
}

function PlayerInBounds () {
	return (player.position.y > minY || player.position.y < -minY);
}
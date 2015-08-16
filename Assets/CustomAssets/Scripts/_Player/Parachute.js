#pragma strict

function Start () {
	Messenger.instance.Listen("deploy_parachute", this);
	Messenger.instance.Listen("retract_parachute", this);
}

function _DeployParachute () {
	animation.Play("ParachuteExpand");
}

function _RetractParachute () {
	animation.Play("ParachuteShrink");
}

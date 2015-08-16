#pragma strict

private var player : Player;
private var playerTransform : Transform;
private var breathParticles : BreathParticles;

private var startTimeScale : int = 0;
private var newScales : int[];

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").GetComponent(Player);
	playerTransform = GameObject.FindGameObjectWithTag("Player").transform;
	breathParticles = GameObject.FindGameObjectWithTag("BreathParticles").GetComponent(BreathParticles);
	
	renderer.sharedMaterial = MaterialsManager.instance.MaterialColor(CustomColor.white);
	
	Messenger.instance.Listen("end_pipe", this);
	Messenger.instance.Listen("restart_game", this);
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
	
	newScales = new int[6];
	var interval : int = Wheel.rows / 6;
	for (var i = 0; i < newScales.Length; i ++) {
		newScales[i] = (interval * i) - 1;
	}
	
}

function DisableCollider () {
	collider.enabled = false;
}

function EnableCollider () {
	collider.enabled = true;
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Net") {
		player.ResetAir();
		new MessageRefillAir();
		SetTimeScale ();
		new MessageEnterRefill ();
	}
}

function OnTriggerStay (other : Collider) {
	if (other.tag == "Net") {
		player.ResetAir();
		breathParticles.MoveToPlayer();
	}
}

function OnTriggerExit (other : Collider) {
	if (other.tag == "Net") {
		new MessageExitRefill ();
	}
}

function SetTimeScale () {
	if (startTimeScale > 0) {
		SendCollectMessage(startTimeScale);
		TimeController.instance.SetTimeScale(startTimeScale);
	}
}

function SendCollectMessage (t : int) {

	new MessageCollectPill();
	switch (t) {
		case 1 : new MessageCollectPill1(); break;
		case 2 : new MessageCollectPill2(); break;
		case 3 : new MessageCollectPill3(); break;
		case 4 : new MessageCollectPill4(); break;
		case 5 : new MessageCollectPill5(); break;
		case 6 : new MessageCollectPill6(); break;
		case 7 : new MessageCollectPill7(); break;
	}
	
}

function _EndPipe () {
	var newRow : int = Wheel.instance.playerRow;
	if (playerTransform.position.y > 0.0) {
		for (var i = startTimeScale + 1; i < newScales.Length; i ++) {
			if (newRow > newScales[i]) {
				startTimeScale = i;
			}
		}
	}
}

function _RestartGame () {
	startTimeScale = 0;
}

function _SaveGame () {
	SaveGameManager.SaveInt ("blank_startTimeScale", startTimeScale);
}

function _LoadGame () {
	startTimeScale = SaveGameManager.LoadInt ("blank_startTimeScale");
}
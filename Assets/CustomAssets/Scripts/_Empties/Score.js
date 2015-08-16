#pragma strict

var bonus : int = 50;
static var coinCount : int = 0;
static var instance : Score;

function Awake () {
	coinCount = 0;
	instance = this;
}

function Start () {
	Messenger.instance.Listen("collect_coin", this);
	Messenger.instance.Listen("collect_bonus", this);
	Messenger.instance.Listen("restart_game", this);
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
}

function AddScore (amt : int) {
	coinCount += amt;
	new MessageUpdateScore();
}

function _CollectCoin () {
	coinCount ++;
	new MessageUpdateScore();
}

function _CollectBonus () {
	coinCount += bonus;
	new MessageUpdateScore();
}

function _RestartGame () {
	coinCount = 0;
	new MessageUpdateScore();
}

function _SaveGame () {
	SaveGameManager.SaveInt ("score_coinCount", coinCount);
}

function _LoadGame () {
	coinCount = SaveGameManager.LoadInt ("score_coinCount");
	new MessageUpdateScore ();
}
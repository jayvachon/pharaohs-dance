#pragma strict

static var inventory : int[] = new int[7];

public enum Item {
	parachute,
	//heaviness,
	//magnet,
	//jump,
	air,
	stomach,
	pill
}

@System.NonSerialized
var crystals : int [] = new int[7];

@HideInInspector
var crystalCount : int = 0;

@HideInInspector
var donutCount : int = 0;
private var donuts : boolean[] = new boolean[6];
private var lastCollectedDonut : int;
private var donutsCollectedCount : int;

static var instance : Inventory;

@HideInInspector
var stomachSize : int = 3;

private var stomachSizes : int[] = [ 3, 5, 7, 10, 15, 25 ];
private var airDurations : int[] = [ 60, 75, 90, 120, 180, 240 ];

function Awake () {
	for (var i = 0; i < inventory.Length; i ++) {
		inventory[i] = 0;
	}
	for (i = 0; i < donuts.Length; i ++) {
		donuts[i] = false;
	}
	instance = this;
	stomachSize = 3;
	RemoveAllCrystals ();
}

function Start () {
	Messenger.instance.Listen("empty_stomach", this);
	Messenger.instance.Listen("restart_game", this);
	Messenger.instance.Listen("collect_crystal1", this);
	Messenger.instance.Listen("collect_crystal2", this);
	Messenger.instance.Listen("collect_crystal3", this);
	Messenger.instance.Listen("collect_crystal4", this);
	Messenger.instance.Listen("collect_crystal5", this);
	Messenger.instance.Listen("collect_crystal6", this);
	Messenger.instance.Listen("collect_donut", this);
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
}

function AddCrystal (type : int) {
	if (crystalCount < stomachSize) {
		crystalCount ++;
		crystals[type] ++;
	}
}

function GetCrystalCount () {
	return crystalCount;
}

function PrintCrystals () {
	for (var i = 0; i < crystals.Length; i ++) {
		Debug.Log(crystals[i]);
	}
}

function RemoveAllCrystals () {
	for (var i = 0; i < crystals.Length; i ++) {
		crystals[i] = 0;
	}
	crystalCount = 0;
}

function SetStomachSize (s : int) {
	stomachSize = stomachSizes[s];
}

function IsStomachFull () {
	return crystalCount >= stomachSize;
}

function AddDonut () {
	donuts[donutCount] = true;
	donutCount ++;
}

function SetLastCollectedDonut (i : int) {
	lastCollectedDonut = i;
}

function GetLastCollectedDonut () {
	return lastCollectedDonut;
}

function GetDonutCount () {
	return donutCount;
}

function GetDonutsCollectedCount () {
	return donutsCollectedCount;
}

function GetItem (item : int) {
	return inventory[item];
}

function GetItemValue (item : int) {
	var val : int;
	switch (item) {
		case Item.stomach : val = stomachSize; break;
		case Item.parachute : val = inventory[item]; break;
		case Item.pill : val = inventory[item]; break;
		case Item.air : val = airDurations[inventory[item]]; break;
	}
	return val;
}

function SetItem (item : int, amount : int) {
	inventory[item] = amount;
	if (item == Item.stomach) {
		SetStomachSize(amount);
	}
	new MessageUpdateInventory();
}

function ResetInventory () {
	for (var i = 0; i < inventory.Length; i ++) {
		inventory[i] = 0;
	}
}

function _EmptyStomach () {
	crystalCount = 0;
	RemoveAllCrystals();
}

function _RestartGame () {
	RemoveAllCrystals();
	ResetInventory();
	stomachSize = stomachSizes[0];
	
	for (var i = 0; i < donuts.Length; i ++) {
		donuts[i] = false;
	}
	donutCount = 0;
	donutsCollectedCount = 0;
	
	yield WaitForFixedUpdate();
	new MessageUpdateInventory();
}

function _CollectCrystal1 () {
	AddCrystal(1);
}

function _CollectCrystal2 () {
	AddCrystal(2);
}

function _CollectCrystal3 () {
	AddCrystal(3);
}

function _CollectCrystal4 () {
	AddCrystal(4);
}

function _CollectCrystal5 () {
	AddCrystal(5);
}

function _CollectCrystal6 () {
	AddCrystal(6);
}

function _CollectDonut () {
	donutsCollectedCount ++;
}

function _SaveGame () {
	SaveGameManager.SaveIntArray	("inventory_inventory", inventory);
	SaveGameManager.SaveIntArray	("inventory_crystals", crystals);
	SaveGameManager.SaveInt			("inventory_crystalCount", crystalCount);
	SaveGameManager.SaveBoolArray	("inventory_donuts", donuts);
	SaveGameManager.SaveInt			("inventory_donutCount", donutCount);
	SaveGameManager.SaveInt			("inventory_lastCollectedDonut", lastCollectedDonut);
	SaveGameManager.SaveInt			("inventory_donutsCollectedCount", donutsCollectedCount);
	SaveGameManager.SaveInt			("inventory_stomachSize", stomachSize);
}

function _LoadGame () {
	inventory = 			SaveGameManager.LoadIntArray	("inventory_inventory");
	crystals = 				SaveGameManager.LoadIntArray	("inventory_crystals");
	crystalCount = 			SaveGameManager.LoadInt			("inventory_crystalCount");
	donuts = 				SaveGameManager.LoadBoolArray	("inventory_donuts");
	donutCount = 			SaveGameManager.LoadInt			("inventory_donutCount");
	lastCollectedDonut = 	SaveGameManager.LoadInt			("inventory_lastCollectedDonut");
	donutsCollectedCount = 	SaveGameManager.LoadInt			("inventory_donutsCollectedCount");
	stomachSize = 			SaveGameManager.LoadInt			("inventory_stomachSize");
	new MessageUpdateInventory ();
}
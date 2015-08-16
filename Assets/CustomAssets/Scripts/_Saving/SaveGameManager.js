#pragma strict

// TODO: REMOVE UPDATE FUNCTION BEFORE LAUNCH! "BACKSPACE/DELETE" DELETES ALL SAVES

/**
  *		Things to save:
  *		/Player
  *			- /Scale
  *			- /Color
  *			- /Gravity
  *			- /Air
  *
  *		/Inventory
  *		/Score
  *		/Stats
  *		/TimeController
  *			- /Current time scale
  *			- /All time scale amounts
  *
  *		Roy's Gift
  *		Wheel		
  *			- /All platform qualities (type, color, button position, # coins on platform, if a pill/crystal/pipe exists)
  *			- /Speed ("difficulty")
  *			- /ActiveInterval
  *		/EndPipes
  *		/Blank
  *			-/Pill bonus (tiers)
  *		Coin trails
  *		/Pipe colors
  *		Donuts!
  *		/HUD - heightZone
  *
  */

public var webVersion : boolean = false;

private var slots : String[] = [ "Slot0", "Slot1", "Slot2", "Slot3" ];
private var gameSlot : int = 0;
public static var instance : SaveGameManager;
private var lockOnQuit : boolean = false;

function Start () {
	if (instance == null) { instance = this; }
	Messenger.instance.Listen ("save_game", this);
}

function Update () {
	if (Input.GetKeyDown (KeyCode.Delete) || Input.GetKeyDown (KeyCode.Backspace)) {
		Debug.Log("Deleted");
		PlayerPrefs.DeleteAll ();
	}
}

static function LockInSave () {
	PlayerPrefs.Save ();
}

static function SlotHasSave (slot : int) : boolean {
	return SaveGameManager.LoadBool ("Slot" + slot.ToString() + ":hasSave", true);
}

function SetSlot (slot : int, savePlatforms : boolean) {
	//LockInSave ();
	gameSlot = slot;
	if (savePlatforms) {
		Wheel.instance.SaveOnCreate ();
	}
}

function GetSlot () {
	return "Slot" + gameSlot.ToString ();
}

static function KeyName (name : String) {
	return SaveGameManager.instance.GetSlot () + ":" + name;
}

static function SaveBool (name : String, val : boolean) {
	PlayerPrefs.SetInt (KeyName (name), val ? 1 : 0);
}

static function LoadBool (name : String) : boolean {
	return PlayerPrefs.GetInt (KeyName (name), 0) == 1 ? true : false;
}

static function SaveBool (name : String, val : boolean, useFullName : boolean) {
	if (useFullName) {
		PlayerPrefs.SetInt (name, val ? 1 : 0);
	} else {
		SaveGameManager.SaveBool (name, val);
	}
}

static function LoadBool (name : String, useFullName : boolean) {
	if (useFullName) {
		return PlayerPrefs.GetInt (name, 0) == 1 ? true : false;
	} else {
		return LoadBool (name);
	}
}

static function SaveInt (name : String, val : int) {
	PlayerPrefs.SetInt (KeyName (name), val);
}

static function SaveInt (name : String, val : int, useFullName : boolean) {
	if (useFullName) {
		PlayerPrefs.SetInt (name, val);
	} else {
		SaveGameManager.SaveInt (name, val);
	}
}

static function LoadInt (name : String) : int {
	return PlayerPrefs.GetInt (KeyName (name), 0);
}

static function LoadInt (name : String, useFullName : boolean) {
	if (useFullName) {
		return PlayerPrefs.GetInt (name, 0);
	} else {
		return LoadInt (name);
	}
}

static function SaveFloat (name : String, val : float) {
	PlayerPrefs.SetFloat (KeyName (name), val);
}

static function SaveFloat (name : String, val : float, useFullName : boolean) {
	if (useFullName) {
		PlayerPrefs.SetFloat (name, val);
	} else {
		SaveGameManager.SaveFloat (name, val);
	}
}

static function LoadFloat (name : String) : float {
	return PlayerPrefs.GetFloat (KeyName (name), 0.0);
}

static function LoadFloat (name : String, useFullName : boolean) {
	if (useFullName) {
		return PlayerPrefs.GetFloat (name, 0);
	} else {
		return LoadFloat (name);
	}
}

static function SaveString (name : String, val : String) {
	PlayerPrefs.SetString (KeyName (name), val);
}

static function LoadString (name : String) : String {
	return PlayerPrefs.GetString (KeyName (name), "");
}

static function SaveVector3 (name : String, val : Vector3) {
	PlayerPrefsX.SetVector3 (KeyName (name), val);
}

static function LoadVector3 (name : String) : Vector3 {
	return PlayerPrefsX.GetVector3 (KeyName (name));
}

static function SaveIntArray (name : String, val : int[]) {
	PlayerPrefsX.SetIntArray (KeyName (name), val);
}

static function LoadIntArray (name : String) : int[] {
	return PlayerPrefsX.GetIntArray (KeyName (name));
}

static function SaveFloatArray (name : String, val : float[]) {
	PlayerPrefsX.SetFloatArray (KeyName (name), val);
}

static function LoadFloatArray (name : String) : float[] {
	return PlayerPrefsX.GetFloatArray (KeyName (name));
}

static function SaveBoolArray (name : String, val : boolean[]) {
	PlayerPrefsX.SetBoolArray (KeyName (name), val);
}

static function SaveBoolArray (name : String, val : boolean[], useFullName : boolean) {
	if (useFullName) {
		PlayerPrefsX.SetBoolArray (name, val);
	} else {
		PlayerPrefsX.SetBoolArray (KeyName (name), val);
	}
}

static function LoadBoolArray (name : String) : boolean[] {
	return PlayerPrefsX.GetBoolArray (KeyName (name));
}

static function SaveStringArray (name : String, val : String[]) {
	PlayerPrefsX.SetStringArray (KeyName (name), val);
}

static function LoadStringArray (name : String) : String[] {
	return PlayerPrefsX.GetStringArray (KeyName (name));
}

static function SaveUnlockable (index : int, val : boolean) {
	SaveGameManager.SaveBool ("unlockable" + index.ToString(), val, true);
}

static function LoadUnlockables () : boolean[] {
	var u : boolean[] = new boolean[3];
	for (var i = 0; i < 3; i ++) {
		u[i] = SaveGameManager.LoadBool ("unlockable" + i.ToString (), true);
	}
	return u;
}

static function HasUnlockables () : boolean {
	for (var i = 0; i < 3; i ++) {
		var b = SaveGameManager.LoadBool ("unlockable" + i.ToString(), true);
		if (b) return true;
	}
	return false;
}

function _SaveGame () {
	lockOnQuit = true;
	Debug.Log ("loq: " + lockOnQuit);
	SaveGameManager.SaveBool ("hasSave", true);
}

function QuitGame () {
	if (!webVersion && lockOnQuit) {
		//Debug.Log ("Saved");
		LockInSave ();
	}
	yield WaitForFixedUpdate ();
	Application.Quit ();
}
/*
function OnApplicationQuit () {
	if (!webVersion && lockOnQuit) {
		//Debug.Log ("Saved");
		LockInSave ();
	}
}*/
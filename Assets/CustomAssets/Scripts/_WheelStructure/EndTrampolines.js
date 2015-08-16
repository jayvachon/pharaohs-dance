#pragma strict

var trampoline : GameObject;
private var trampolineCount : int = 24;
private var myTransform : Transform;
private var yPos : float;
private var player : Transform;

private var ending : boolean = false;

private var unlockables : boolean[] = [ false, false, false ];
private var allUnlocked : boolean = false;
private var gotUnlockable : boolean = false;

function Awake () {
	myTransform = transform;
}

function Start () {
	SetYPos ();
	SetPlayer ();

	unlockables = SaveGameManager.LoadUnlockables ();
	allUnlocked = SetAllUnlocked ();
	CreateTrampolines ();
	InvokeRepeating("CheckPlayerPosition", 0, 2);
	Messenger.instance.Listen ("load_game", this);
}

function SetAllUnlocked () {
	for (var i = 0; i < unlockables.Length; i ++) {
		if (!unlockables[i]) return false;
	}
	return true;
}

function SetYPos () {
	myTransform.position.y = ((Wheel.rows + 3.0) * Wheel.radius);
	yPos = myTransform.position.y;
}

function SetPlayer () {
	player = GameObject.Find("Player").transform;
}

function CreateTrampolines () {
	
	var pathCount : int = 3;
	var r : float = 20.0;
	var deg = 360.0 / pathCount;
									// -5 because i did bad math on the credit screen. but whatever, it works.
	for (var i = 0; i < trampolineCount - 5; i ++) {
		
		var y : float = yPos + (i * Wheel.radius * 2);
		for (var j = 0; j < pathCount; j ++) {
			
			var x : float = 0.0;
			var z : float = 0.0;
			
			if (i > 8) {
				if (allUnlocked) {
					z = 0;
				} else {
					var rad = (j * deg) * Mathf.Deg2Rad;
					if (j == 0) {
						if (unlockables[0]) continue;
						z = -20;
					} else if (j == 1) {
						if (unlockables[1]) continue;
						z = 0;
					} else {
						if (unlockables[2]) continue;
						z = 20;
					}
				}
			}
			
			var t : TrampolineOutline = GameObject.Instantiate(trampoline, 
																Vector3(myTransform.position.x + x, y, myTransform.position.z + z),
																Quaternion.identity).GetComponent(TrampolineOutline);
			
			t.topTrampoline = true;
			
			if (i > 8) {
				if (allUnlocked) {
					t.ColorTrampoline(6);
				} else {
					var c : int;
					if (j == 0) 
						c = 0;
					else if (j == 1)
						c = 6;
					else 
						c = 2;
						
					t.ColorTrampoline(c);
				}
			}
		}
	}
}

function GetEndY () : float {
	return yPos + (trampolineCount * Wheel.radius * 2);
}

function CheckPlayerPosition () {
	if (player.position.y >= yPos + 2) {
		if (!ending) {
			new MessageEnterEnd ();
			ending = true;
		}
	} else {
		if (ending) {
			new MessageExitEnd ();
			ending = false;
		}
	}
}

function EndGame (pz : float) {
	if (gotUnlockable) return;
	if (pz > 7.0) {
		SaveGameManager.SaveUnlockable (2, true);
	} else if (pz < -7.0) {
		SaveGameManager.SaveUnlockable (0, true);
	} else {
		SaveGameManager.SaveUnlockable (1, true);
	}
	gotUnlockable = true;
	SaveGameManager.SaveBool ("endTrampoline_gotUnlockable", gotUnlockable);
}

function _LoadGame () {
	gotUnlockable = SaveGameManager.LoadBool ("endTrampoline_gotUnlockable");
}
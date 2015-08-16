#pragma strict

// TODO: _PressButton ()

public var player : Transform;

public var pill : GameObject;
private var pillPitch : FXPitch;

public var pillReverse : GameObject;
private var pillReversePitch : FXPitch;

public var crystal : GameObject;
private var crystalPitch : FXPitch;

public var donut : GameObject;
private var donutPitch : FXPitch;

public var openPipe : GameObject;
private var openPipePitch : FXPitch;

private var drone : String[] = [ "OrganDrone01", 
								"OrganDrone02", 
								"OrganDrone03", 
								"OrganDrone04", 
								"OrganDrone05", 
								"OrganDrone06", 
								"OrganDrone07"
								];
private var pillPlaying : boolean[] = new boolean[7];
private var metro : Metronome;

public static var instance : AudioMessageListener;

private var coinCreatedCount : int = 0;

function Awake () {
	
	if (instance == null) { instance = this; }
	
	pillPitch = pill.GetComponent (FXPitch);
	pillReversePitch = pillReverse.GetComponent (FXPitch);
	crystalPitch = crystal.GetComponent (FXPitch);
	donutPitch = donut.GetComponent (FXPitch);
	openPipePitch = openPipe.GetComponent (FXPitch);
	
	for (var i : int = 0; i < pillPlaying.Length; i ++) {
		pillPlaying[i] = false;
	}
	InvokeRepeating ("SetPan", 0.0, 0.25);
}

function Start () {
	
	metro = AudioManager.GetMetronome ("Main");
	
	// Menus
	Messenger.instance.Listen("close_startscreen", this);
	
	// Collect events
	Messenger.instance.Listen("collect_coin", this);
	
	Messenger.instance.Listen("collect_pill", this);
	Messenger.instance.Listen("collect_pill1", this);
	Messenger.instance.Listen("collect_pill2", this);
	Messenger.instance.Listen("collect_pill3", this);
	Messenger.instance.Listen("collect_pill4", this);
	Messenger.instance.Listen("collect_pill5", this);
	Messenger.instance.Listen("collect_pill6", this);
	Messenger.instance.Listen("collect_pill7", this);
	
	Messenger.instance.Listen("collect_crystal", this);
	Messenger.instance.Listen("collect_crystal1", this);
	Messenger.instance.Listen("collect_crystal2", this);
	Messenger.instance.Listen("collect_crystal3", this);
	Messenger.instance.Listen("collect_crystal4", this);
	Messenger.instance.Listen("collect_crystal5", this);
	Messenger.instance.Listen("collect_crystal6", this);
	Messenger.instance.Listen("collect_crystal7", this);
	
	Messenger.instance.Listen("collect_donut", this);
	
	Messenger.instance.Listen("create_coin", this);
	Messenger.instance.Listen("create_pill", this);
	Messenger.instance.Listen("create_crystal", this);
	Messenger.instance.Listen("create_donut", this);
	
	// Reverser
	Messenger.instance.Listen("collect_reverser", this);
	
	// Button
	Messenger.instance.Listen("bottomed_button", this);
	
	// Pipe
	Messenger.instance.Listen("begin_pipe", this);
	
	// Time
	Messenger.instance.Listen("change_time", this);
	
	// Air
	Messenger.instance.Listen("refill_air", this);
	Messenger.instance.Listen("get_air", this);
	Messenger.instance.Listen("air_critical", this);
	Messenger.instance.Listen("collect_airbonus", this);
	
	// Player
	Messenger.instance.Listen("player_falling", this);
	Messenger.instance.Listen("player_land", this);
	Messenger.instance.Listen("player_died", this);
	Messenger.instance.Listen("player_fall", this);
	Messenger.instance.Listen("player_rise", this);
	Messenger.instance.Listen("player_jump", this);
	Messenger.instance.Listen("empty_stomach", this);
	Messenger.instance.Listen("deploy_parachute", this);
	Messenger.instance.Listen("retract_parachute", this);
	
	// Other
	Messenger.instance.Listen("trampoline_bounce", this);
	Messenger.instance.Listen("create_pipe", this);
	Messenger.instance.Listen("tier_reached", this);
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("new_row", this);
	Messenger.instance.Listen("open_screen", this);
	Messenger.instance.Listen("close_screen", this);
	
	//InvokeRepeating ("PlayBubbles", 0.0, 0.33);
	InvokeRepeating ("PlayBubbles", 0.0, 0.25);
	//PlayBubbles ();
}

function PlayBubbles () {
	AudioManager.PlayElement ("Bubbles", new PlaySettings (metro, 0.125));
	//AudioManager.PlayElement ("Bubbles", new PlaySettings (metro, SnapStyle.BeatValue, 0.25, true, 0.0));
}

// Menus
function _CloseStartscreen () {
	AudioManager.PlayElement ("BeatMain", new PlaySettings(metro, SnapStyle.BeatInMeasure, 1f, true, 5f));
}

/**
  * Collect events
  */
// Coins
function _CollectCoin () {
	AudioManager.PlayEvent("CollectCoin");
}

// Pills
function _CollectPill () {
	AudioManager.PlayEvent("CollectPill");
}

function _CollectPill1 () {
	PlayPill (0);
}

function _CollectPill2 () {
	PlayPill (1);
}

function _CollectPill3 () {
	PlayPill (2);
}

function _CollectPill4 () {
	PlayPill (3);
}

function _CollectPill5 () {
	PlayPill (4);
}

function _CollectPill6 () {
	PlayPill (5);
}

function _CollectPill7 () {
	PlayPill (6);
}

// Crystals
function _CollectCrystal () {
	AudioManager.PlayEvent("CollectCrystal");
	yield WaitForFixedUpdate ();
	if (Inventory.instance.IsStomachFull()) {
		AudioManager.PlayElement ("StomachFull", new PlaySettings (metro, SnapStyle.BeatValue, 0.25, 0.5, false, 0f, FadeType.Lin, 1f));
	}
}

function _CollectCrystal1 () {
	crystalPitch.SetPitch (0, 1);
}

function _CollectCrystal2 () {
	crystalPitch.SetPitch (1, 1);
}

function _CollectCrystal3 () {
	crystalPitch.SetPitch (2, 1);
}

function _CollectCrystal4 () {
	crystalPitch.SetPitch (3, 1);
}

function _CollectCrystal5 () {
	crystalPitch.SetPitch (4, 1);
}

function _CollectCrystal6 () {
	crystalPitch.SetPitch (0, 2);
}

function _CollectCrystal7 () {
	//crystalPitch.SetPitch (1, 2);
	AudioManager.PlayElement ("PurgeStomach", new PlaySettings (metro, 0.25));
}

// Donuts
function _CollectDonut () {
	PlayDonut (Inventory.instance.GetLastCollectedDonut ());
}

function PlayDonut (p : int) {
	donutPitch.SetPitch (p);
	AudioManager.PlayElement ("Donut", new PlaySettings (metro, 0.125));
}

function _CreateCoin () {
	AudioManager.PlayElement ("CreateCoin", new PlaySettings (metro, SnapStyle.BeatValue, 0.125, Random.Range (0.0, 1.0), false, 0.0, FadeType.Lin, 1f));
}

function _CreatePill () {
	AudioManager.PlayElement ("CreatePill", new PlaySettings (metro, 0.25));
}

function _CreateCrystal () {
	AudioManager.PlayElement ("CreateCrystal", new PlaySettings (metro, 0.25));
}

function _CreateDonut () {
	AudioManager.PlayElement ("CreateDonut", new PlaySettings (metro, 0.25));
}

// Reverser
function _CollectReverser () {
	AudioManager.PlayEvent ("CollectReverser");
}

// Button
function _BottomedButton () {
	AudioManager.PlayEvent ("BottomButton");
}

// Pipe
function _BeginPipe () {
	AudioManager.PlayEvent ("Pipe");
}

// Time
function _ChangeTime () {
	for (var i = 0; i < pillPlaying.Length; i ++) {
		if (TimeController.scalePeriods[i + 1] == 0.0) {
			if (pillPlaying[i]) {
				PlayPillReverse (i);
			}
		}
	}
}

function PlayPillReverse (step : int) {
	var o : int = 1;
	var s : int = step;
	if (s > 4) { 
		s -= 4; 
		o += 1;
	}
	pillReversePitch.SetPitch (s, o);
	AudioManager.StopEvent ("CollectPill");
	pillPlaying[step] = false;
	AudioManager.StopElement (drone[step], new StopSettings (5f));
}

function PlayPill (step : int) {
	var o : int = 1;
	var s : int = step;
	if (s > 4) { 
		s -= 4; 
		o += 1;
	}
	pillPitch.SetPitch (s, o);
	pillPlaying[step] = true;
	AudioManager.PlayElement (drone[step], new PlaySettings (metro, SnapStyle.BeatInMeasure, 1f, true, 5f));
}

// Air
function _CollectAirbonus () {
	_RefillAir ();
}

function _RefillAir () {
	if (AudioManager.GetEnergy ("Air").Get() >= 0.1) {
		AudioManager.PlayElement ("Cymbal", new PlaySettings (metro, SnapStyle.BeatInMeasure, 2f, 2f, false, 0f, FadeType.Lin, 1f));
	}
	AudioManager.PlayEvent ("RefillAir");
	AudioManager.StopEvent ("GetAir");
}

function _GetAir () {
	AudioManager.PlayEvent ("GetAir");
}

function _AirCritical () {
	AudioManager.PlayEvent ("GetAir");
}

// Player
function _PlayerDied () {
	AudioManager.PlayEvent ("Death");
	AudioManager.StopCategory ("Music", new StopSettings (metro, SnapStyle.BeatInMeasure, 1f, 0f, FadeType.Lin, 1f));
}

function _PlayerFall () {
	AudioManager.PlayEvent ("Underside");
}

function _PlayerRise () {
	AudioManager.StopEvent ("Underside");
}

function _PlayerJump () {
	AudioManager.PlayElement ("HihatClosed", new PlaySettings (metro, 0.33f));
}

function _DeployParachute () {
	AudioManager.PlayEvent ("Parachute");
}

function _RetractParachute () {
	AudioManager.StopEvent ("Parachute");
}

// Other
function _TrampolineBounce () {
	AudioManager.PlayEvent ("Trampoline");
}

function _CreatePipe () {
	AudioManager.PlayEvent ("OpenPipe");
}

function _TierReached () {
	//AudioManager.PlayElement ("Tier", new PlaySettings (metro, SnapStyle.BeatValue, 0.5, 1.0, false, 0.0, FadeType.Lin, 1.0));
	AudioManager.PlayElement ("Tier", new PlaySettings (metro, 0.5));
	AudioManager.SetCategoryVolume ("GetAirCut", new FadeSettings (0.33, 0.25));
	yield WaitForSeconds (1.5);
	AudioManager.SetCategoryVolume ("GetAirCut", new FadeSettings (1.0, 2.0));
}

function _SaveGame () {
	AudioManager.PlayElement ("SaveGame", new PlaySettings (metro, 0.5));
}

function _NewRow () {
	if (player.position.y > 0) {
		AudioManager.StopElement ("Bottom", new StopSettings (metro, 1));
		return;
	} else {
		var vol : float = (Wheel.playerRow + 1.0) / (Wheel.rows + 0.0);
		vol = MathfExtended.SteepErp (0.0, 1.0, 5f, vol);
		if (AudioManager.GetElement ("Bottom").IsPlaying()) {
			AudioManager.SetElementVolume ("Bottom", vol);
		} else {
			AudioManager.PlayElement ("Bottom", new PlaySettings (metro, SnapStyle.BeatInMeasure, 1.0, true, 0.0));
			AudioManager.SetElementVolume ("Bottom", 0.0);
		}
	}
}

function _OpenScreen () {
	AudioManager.PlayElement ("StoreEnter", new PlaySettings (metro, 0.5));
}

function _CloseScreen () {
	AudioManager.PlayElement ("StoreExit", new PlaySettings (metro, 0.5));
}

function SetPan () {
	var target = Vector3 (player.position.z, player.position.y) - Vector3.zero;
	var angle = Vector3.Angle (player.position, Vector3.forward);
	AudioManager.SetCategoryPan ("Music", Mathf.Lerp (1.0, 0.0, angle / 180.0));
	AudioManager.SetCategoryPan ("SFX", Mathf.Lerp (1.0, 0.0, angle / 180.0));
}

#pragma strict

static var timeScale : float = 1.0;													// Regular speed = 1.0, half speed = 0.5, etc.
static var timeScales : float[] = [ 1.0, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0, -1.5 ];		// When pills are collected, these are the new time scales
static var scalePeriods : int[] = [ 0, 0, 0, 0, 0, 0, 0, 0 ];						// Length of time remaining within each time scale
private var scalePeriodsMax : int[] = [ 0, 0, 0, 0, 0, 0, 0, 0 ];					// Maximum time remaining within each time scale
private var currentScale : int = 0;													// The position in the array of the time scale we're at

private var defaultPeriod : int = 40;												// Amount of time typically added to a time scale period (in quarter seconds)
private var defaults : int[] = [ 10, 12, 15, 20, 25, 30 ];							// Upgradable default time (in seconds)
static var periodPositions : float[] = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];	// Percentage of period remaining

static var instance : TimeController;

static var reverserTimeScale : float = 1.0;											// When a reverser is collected, we change this variable instead of the regular timeScale so that things don't get fucked up

public var invoking : boolean = false;

function Awake () {
	timeScale = 1.0;
	for (var i = 0; i < scalePeriods.Length; i ++) {
		scalePeriods[i] = 0;
		scalePeriodsMax[i] = 0;
		periodPositions[i] = 0.0;
	}
	
	instance = this;
	
}

function Start () {
	Messenger.instance.Listen("open_tutorial", this);
	Messenger.instance.Listen("close_tutorial", this);
	Messenger.instance.Listen("restart_game", this);
	Messenger.instance.Listen("open_screen", this);
	Messenger.instance.Listen("close_screen", this);
	Messenger.instance.Listen("update_inventory", this);
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
	
	BeginInvoke();
}

function AddToTimeScale (scale : int) {

	// Add time to this scale
	scalePeriods[scale] += defaultPeriod;
	scalePeriodsMax[scale] = scalePeriods[scale];
	
	SetPeriodPosition(scale);
		
	// If this scale is smaller than the one we're at, change the time scale
	if (timeScale > timeScales[scale]) {
		currentScale = scale;
		new MessageChangeTime();
		yield StartCoroutine(ChangeTimeScale(timeScales[scale]));
		
	}
}

function AddToTimeScale (scale : int, period : int) {
	
	// Add time to this scale
	scalePeriods[scale] += period;
	scalePeriodsMax[scale] = scalePeriods[scale];
	
	SetPeriodPosition(scale);
	
	// If this scale is smaller than the one we're at, change the time scale
	if (timeScale > scale) {
		currentScale = scale;
		yield StartCoroutine(ChangeTimeScale(timeScales[scale]));
		new MessageChangeTime();
	}
}

function SetTimeScale (scale : int) {
	
	var p : int = defaultPeriod * 2;
	
	if (scalePeriods[scale] < p) {
		// Add time to this scale
		scalePeriods[scale] = p;
		scalePeriodsMax[scale] = scalePeriods[scale];
		
		SetPeriodPosition(scale);
			
		// If this scale is smaller than the one we're at, change the time scale
		if (timeScale > timeScales[scale]) {
			currentScale = scale;
			yield StartCoroutine(ChangeTimeScale(timeScales[scale]));
			new MessageChangeTime();
		}
	}
}

function ChangeTimeScale (newScale : float) {

	var time : float = 1.0;
	var elapsedTime : float = 0.0;
	var startScale : float = timeScale;
	
	while (elapsedTime < time && invoking) {
		elapsedTime += Time.deltaTime;
		timeScale = Mathf.Lerp(startScale, newScale, elapsedTime / time);
		new MessageLerpTime();
		yield;
	}
	
}

function CountDown () {
	if (currentScale > 0) {
		if (scalePeriods[currentScale] > 0) {
			scalePeriods[currentScale] --;
			SetPeriodPosition(currentScale);
		} else {
			var nextScale : int = 0;
			for (var i = scalePeriods.Length - 1; i > -1; i --) {
				if (scalePeriods[i] > 0 || i == 0) {
					nextScale = i;
					break;
				}
			}

			currentScale = nextScale;
			StartCoroutine(ChangeTimeScale(timeScales[currentScale]));
			new MessageChangeTime();
		}
	}
		
}

function SetPeriodPosition (scale : int) {
	if (scalePeriodsMax[scale] > 0) {
		periodPositions[scale] = (scalePeriods[scale] + 0.0) / (scalePeriodsMax[scale] + 0.0);
	}
}

function GetCurrentScale () {
	return timeScales[currentScale];
}

function GetScalePosition () {
	return currentScale;
}

function BeginInvoke () {
	if (!invoking) {
		InvokeRepeating("CountDown", 0.0, 0.25);
		invoking = true;
	}
}

function EndInvoke () {
	if (invoking) {
		CancelInvoke("CountDown");
		invoking = false;
	}
}

function PauseCountDown () {
	EndInvoke ();
}

function ResumeCountDown () {
	BeginInvoke ();
	
	// Check to see if we were transitioning between time scales
	// If we were, restart that coroutine
	if (timeScale == timeScales[currentScale])
		return;
		
	yield StartCoroutine(ChangeTimeScale(timeScales[currentScale]));
	new MessageChangeTime();
}

function _RestartGame () {
	timeScale = 1.0;	
	scalePeriods = [ 0, 0, 0, 0, 0, 0, 0, 0 ];
	scalePeriodsMax = [ 0, 0, 0, 0, 0, 0, 0, 0 ];	
	currentScale = 0;
	defaultPeriod = 40;		
	periodPositions = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];
	new MessageLerpTime();
	new MessageChangeTime();
}

function _OpenScreen () {
	EndInvoke ();
}

function _CloseScreen () {
	BeginInvoke ();
}

function _OpenTutorial () {
	EndInvoke ();
}

function _CloseTutorial () {
	BeginInvoke ();
}

function _UpdateInventory () {
	defaultPeriod = defaults[Inventory.instance.GetItemValue(Item.pill)] * 4;
}

function _SaveGame () {
	SaveGameManager.SaveFloat		 ("timeController_timeScale", timeScale);
	SaveGameManager.SaveIntArray	 ("timeController_scalePeriods", scalePeriods);
	SaveGameManager.SaveIntArray	 ("timeController_scalePeriodsMax", scalePeriodsMax);
	SaveGameManager.SaveInt		 	 ("timeController_currentScale", currentScale);
	SaveGameManager.SaveFloatArray	 ("timeController_periodPositions", periodPositions);
	SaveGameManager.SaveInt		 	 ("timeController_defaultPeriod", defaultPeriod);
	SaveGameManager.SaveFloat		 ("timeController_reverserTimeScale", reverserTimeScale);	
}

function _LoadGame () {
	timeScale = 		SaveGameManager.LoadFloat		 ("timeController_timeScale");
	scalePeriods = 		SaveGameManager.LoadIntArray	 ("timeController_scalePeriods");
	scalePeriodsMax = 	SaveGameManager.LoadIntArray	 ("timeController_scalePeriodsMax");
	currentScale = 		SaveGameManager.LoadInt		 	 ("timeController_currentScale");
	periodPositions = 	SaveGameManager.LoadFloatArray	 ("timeController_periodPositions");
	defaultPeriod = 	SaveGameManager.LoadInt		 	 ("timeController_defaultPeriod");
	reverserTimeScale = SaveGameManager.LoadFloat		 ("timeController_reverserTimeScale");
	new MessageLerpTime();
	new MessageChangeTime();
}
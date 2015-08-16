#pragma strict

public var player : Transform;
public var titleStyle : GUIStyle;
public var statStyle : GUIStyle;

/* Collect */
private var coinCount : int = 0;
private var pillCount : int = 0;
private var crystalCount : int = 0;
private var reverserCount : int = 0;
private var airBonusCount : int = 0;
private var purgeCount : int = 0;
private var foundRoy : boolean = false;

private var tCoinCount : int = 0;
private var tPillCount : int = 0;
private var tCrystalCount : int = 0;
private var tReverserCount : int = 0;
private var tAirBonusCount : int = 0;
private var tPurgeCount : int = 0;

private var startCoinCount : int = 0;
private var startPillCount : int = 0;
private var startCrystalCount : int = 0;
private var startReverserCount : int = 0;
private var startAirBonusCount : int = 0;
private var startPurgeCount : int = 0;

/* Other */
private var airRefilledCount : int = 0;			
private var buttonsPressedCount : int = 0;		
private var pipesCreatedCount : int = 0;		
private var fallCount : int = 0;				
private var largestAscent : int = 0;			
private var largestFall : int = 0;				
private var timePlayed : float;
private var timeAboveCenter : float = 0.0;
private var timeBelowCenter : float = 0.0;

private var tAirRefilledCount : int = 0;			
private var tButtonsPressedCount : int = 0;		
private var tPipesCreatedCount : int = 0;		
private var tFallCount : int = 0;				
private var tLargestAscent : int = 0;			
private var tLargestFall : int = 0;				
private var tTimePlayed : float;
private var tTimeAboveCenter : float = 0.0;
private var tTimeBelowCenter : float = 0.0;

private var startAirRefilledCount : int = 0;			
private var startButtonsPressedCount : int = 0;		
private var startPipesCreatedCount : int = 0;		
private var startFallCount : int = 0;				
private var startLargestAscent : int = 0;			
private var startLargestFall : int = 0;				
private var startTimePlayed : float;
private var startTimeAboveCenter : float = 0.0;
private var startTimeBelowCenter : float = 0.0;

/* Not stats */
private var countTime : boolean = false;
private var endPipeAscent : boolean = false;	// Don't count the ascent if the player went up with an end pipe
private var highRow : int = 0;
private var lowRow : int = 0;
private var playerAbove : boolean = true;

/* GUI */
private var screenUp : boolean = false;
private var statCount : int;
private var titles : String[] =   [ "Coins collected",
									"Pills collected",
									"Crystals collected",
									"Reversers collected",
									"Air bonuses collected",
									"Purges",
									"Found Roy's Gift",
									"Air refilled",

									"Buttons pressed",
									"Pipes created",
									"Falls",
									"Largest ascent",
									"Largest fall",
									"Time played",
									"Time above center",
									"Time below center" ];
private var stats : String[];
private var bests : String[];

private var titleRect : Rect;
private var statRects : Rect[];
private var columnTitleY : int;
private var fullScreen : Rect;
private var texBlack : Texture2D;
private var screenDimensions : ScreenDimensions = new ScreenDimensions ();

function Start () {

	SetMessages ();
	
	statCount = titles.Length;
	stats = new String[statCount];
	bests = new String[statCount];
	
	var maxWidth : float = 1152.0;
	var ratio : float = Mathf.Lerp(0.0, 1.0, (Screen.width + 0.0) / maxWidth);
	statStyle.fontSize *= ratio;
	titleStyle.fontSize *= ratio;
	
	titleRect = GUIPlus.CenteredRect (screenDimensions.center, 
									  screenDimensions.top,
									  screenDimensions.width,
									  titleStyle.fontSize);
	InitStatRects ();
	columnTitleY = screenDimensions.top + (titleRect.height);
	
	var col : Color = CustomColor.black;
	col.a = 0.75;
	texBlack = GUIPlus.CreateTextureFromColor (col);
	fullScreen = Rect(0, 0, screenDimensions.width, screenDimensions.height);	
	
	LoadTotals ();
}

function SetMessages () {

	/* Collect */
	Messenger.instance.Listen ("collect_coin", this);
	Messenger.instance.Listen ("collect_pill", this);
	Messenger.instance.Listen ("collect_crystal", this);
	Messenger.instance.Listen ("collect_reverser", this);
	Messenger.instance.Listen ("collect_airbonus", this);
	Messenger.instance.Listen ("collect_crystal7", this);
	Messenger.instance.Listen ("collect_crystal0", this);
	
	/* Other */
	Messenger.instance.Listen ("player_fall", this);
	Messenger.instance.Listen ("bottomed_button", this);
	Messenger.instance.Listen ("create_pipe", this);
	Messenger.instance.Listen ("new_row", this);
	Messenger.instance.Listen ("refill_air", this);
	Messenger.instance.Listen ("player_rise", this);
	
	Messenger.instance.Listen ("restart_game", this);
	Messenger.instance.Listen ("open_startscreen", this);
	Messenger.instance.Listen ("close_startscreen", this);
	
	Messenger.instance.Listen ("save_game", this);
	Messenger.instance.Listen ("load_game", this);

}

function InitStatRects () {

	var textHeight : int = statStyle.fontSize;
	var ySep : int = textHeight * 0.85;
	var breakPoint : int = 7;
	var top : int = screenDimensions.top + titleRect.height + (textHeight * 2);
	var xSep : int = screenDimensions.left - (screenDimensions.border / 2);
	
	statRects = new Rect[statCount];
	for (var i : int = 0; i < statCount; i ++) {
		var xPos : int = (i > breakPoint) ? screenDimensions.center + (xSep / 2) : xSep; //screenDimensions.center + screenDimensions.border : screenDimensions.left;
		var yPos : int = (i > breakPoint) ? top + ((textHeight + ySep) * (i - (breakPoint + 1))) : top + ((textHeight + ySep) * i);
		statRects[i] = new Rect (xPos,
								 yPos,
								 screenDimensions.width / 2,
								 textHeight);
	}
}

function Update () {
	if (!countTime) return;
	timePlayed += Time.deltaTime;
	if (playerAbove) {
		timeAboveCenter += Time.deltaTime;
	} else {
		timeBelowCenter += Time.deltaTime;
	}
}

/* Collect */
function _CollectCoin () {
	coinCount ++;
}

function _CollectPill () {
	pillCount ++;
}

function _CollectCrystal () {
	crystalCount ++;
}

function _CollectReverser () {
	reverserCount ++;
}

function _CollectAirbonus () {
	airBonusCount ++;
}

function _CollectCrystal7 () {
	purgeCount ++;
}

function _CollectCrystal0 () {
	foundRoy = true;
}

/* Other */
function _RefillAir () {
	airRefilledCount ++;
	
	// Make sure that we're not hearing this message because of an air bonus
	if (player.position.y < 30.0 && player.position.y > -30.0) {
		endPipeAscent = false;
		var fall : int = highRow + lowRow;
		if (fall > largestFall) {
			largestFall = fall;
		}
		lowRow = 0;
		highRow = 0;
	}
}

function _BottomedButton () {
	buttonsPressedCount ++;
}

function _CreatePipe () {
	pipesCreatedCount ++;
}

function _PlayerFall () {
	fallCount ++;
	playerAbove = false;
}

function _PlayerRise () {
	playerAbove = true;
}

function _NewRow () {
	var playerRow : int = Wheel.playerRow;
	if (playerAbove) {
		if (playerRow <= 1) {
			if (player.position.x > 10.0) {
				endPipeAscent = true;
			}
		}
		if (playerRow > largestAscent && !endPipeAscent) {
			largestAscent = playerRow;
		}
		if (playerRow > highRow) {
			highRow = playerRow;
		}
	} else {
		if (Mathf.Abs (playerRow) > lowRow) {
			lowRow = Mathf.Abs (playerRow);
		}
	}
}

function _RestartGame () {
	ResetCounts ();
	endPipeAscent = false;
}

function _OpenStartscreen () {
	countTime = false;
}

function _CloseStartscreen () {
	countTime = true;
}

function ResetCounts () {

	/* Collect */
	coinCount = 0;
	pillCount = 0;
	crystalCount = 0;
	reverserCount = 0;
	airBonusCount = 0;
	purgeCount = 0;
	foundRoy = false;
	
	/* Other */
	airRefilledCount = 0;		
	buttonsPressedCount = 0;
	pipesCreatedCount = 0;
	fallCount = 0;
	largestAscent = 0;
	largestFall = 0;
	timeAboveCenter = 0.0;
	timeBelowCenter = 0.0;
	
	/* Start counts */
	startCoinCount = 0;
	startPillCount = 0;
	startCrystalCount = 0;
	startReverserCount = 0;
	startAirBonusCount = 0;
	startPurgeCount = 0;
	
	startAirRefilledCount = 0;			
	startButtonsPressedCount = 0;		
	startPipesCreatedCount = 0;		
	startFallCount = 0;				
	startLargestAscent = 0;			
	startLargestFall = 0;				
	startTimePlayed = 0.0;
	startTimeAboveCenter = 0.0;
	startTimeBelowCenter = 0.0;
		
}

function OpenStats () {
	UpdateScreen ();
	screenUp = true;
}

function CloseStats () {
	screenUp = false;
}

function _SaveGame () {
	
	UpdateScreen ();
	
	/* This game */
	SaveGameManager.SaveInt ("stats_coinCount", coinCount);
	SaveGameManager.SaveInt ("stats_pillCount", pillCount);
	SaveGameManager.SaveInt ("stats_crystalCount", crystalCount);
	SaveGameManager.SaveInt ("stats_reverserCount", reverserCount);
	SaveGameManager.SaveInt ("stats_airBonusCount", airBonusCount);
	SaveGameManager.SaveInt ("stats_purgeCount", purgeCount);
	SaveGameManager.SaveBool ("stats_foundRoy", foundRoy);
	
	SaveGameManager.SaveInt ("stats_airRefilledCount", airRefilledCount);
	SaveGameManager.SaveInt ("stats_buttonsPressedCount", buttonsPressedCount);
	SaveGameManager.SaveInt ("stats_pipesCreateCount", pipesCreatedCount);
	SaveGameManager.SaveInt ("stats_fallCount", fallCount);
	SaveGameManager.SaveInt ("stats_largestAscent", largestAscent);
	SaveGameManager.SaveInt ("stats_largestFall", largestFall);
	SaveGameManager.SaveFloat ("stats_timePlayed", timePlayed);
	SaveGameManager.SaveFloat ("stats_timeAboveCenter", timeAboveCenter);
	SaveGameManager.SaveFloat ("stats_timeBelowCenter", timeBelowCenter);
	
	/* Totals */
	SaveGameManager.SaveInt ("stats_tCoinCount", tCoinCount, true);
	SaveGameManager.SaveInt ("stats_tPillCount", tPillCount, true);
	SaveGameManager.SaveInt ("stats_tCrystalCount", tCrystalCount, true);
	SaveGameManager.SaveInt ("stats_tReverserCount", tReverserCount, true);
	SaveGameManager.SaveInt ("stats_tAirBonusCount", tAirBonusCount, true);
	SaveGameManager.SaveInt ("stats_tPurgeCount", tPurgeCount, true);
	
	SaveGameManager.SaveInt ("stats_tAirRefilledCount", tAirRefilledCount, true);
	SaveGameManager.SaveInt ("stats_tButtonsPressedCount", tButtonsPressedCount, true);
	SaveGameManager.SaveInt ("stats_tPipesCreateCount", tPipesCreatedCount, true);
	SaveGameManager.SaveInt ("stats_tFallCount", tFallCount, true);
	SaveGameManager.SaveInt ("stats_tLargestAscent", tLargestAscent, true);
	SaveGameManager.SaveInt ("stats_tLargestFall", tLargestFall, true);
	SaveGameManager.SaveFloat ("stats_tTimePlayed", tTimePlayed, true);
	SaveGameManager.SaveFloat ("stats_tTimeAboveCenter", tTimeAboveCenter, true);
	SaveGameManager.SaveFloat ("stats_tTimeBelowCenter", tTimeBelowCenter, true);
}

function _LoadGame () {
	
	/* This game */
	coinCount = SaveGameManager.LoadInt ("stats_coinCount");
	pillCount = SaveGameManager.LoadInt ("stats_pillCount");
	crystalCount = SaveGameManager.LoadInt ("stats_crystalCount");
	reverserCount = SaveGameManager.LoadInt ("stats_reverserCount");
	airBonusCount = SaveGameManager.LoadInt ("stats_airBonusCount");
	purgeCount = SaveGameManager.LoadInt ("stats_purgeCount");
	foundRoy = SaveGameManager.LoadBool ("stats_foundRoy");
	
	airRefilledCount = SaveGameManager.LoadInt ("stats_airRefilledCount");
	buttonsPressedCount = SaveGameManager.LoadInt ("stats_buttonsPressedCount");
	pipesCreatedCount = SaveGameManager.LoadInt ("stats_pipesCreateCount");
	fallCount = SaveGameManager.LoadInt ("stats_fallCount");
	largestAscent = SaveGameManager.LoadInt ("stats_largestAscent");
	largestFall = SaveGameManager.LoadInt ("stats_largestFall");
	timePlayed = SaveGameManager.LoadFloat ("stats_timePlayed");
	timeAboveCenter = SaveGameManager.LoadFloat ("stats_timeAboveCenter");
	timeBelowCenter = SaveGameManager.LoadFloat ("stats_timeBelowCenter");
	
	/* Start counts */
	startCoinCount = coinCount;
	startPillCount = pillCount;
	startCrystalCount = crystalCount;
	startReverserCount = reverserCount;
	startAirBonusCount = airBonusCount;
	startPurgeCount = purgeCount;
	
	startAirRefilledCount = airRefilledCount;			
	startButtonsPressedCount = buttonsPressedCount;		
	startPipesCreatedCount = pipesCreatedCount;		
	startFallCount = fallCount;				
	startLargestAscent = largestAscent;			
	startLargestFall = largestFall;				
	startTimePlayed = timePlayed;
	startTimeAboveCenter = timeAboveCenter;
	startTimeBelowCenter = timeBelowCenter;
	
}

function LoadTotals () {

	/* Totals */
	tCoinCount = SaveGameManager.LoadInt ("stats_tCoinCount", true);
	tPillCount = SaveGameManager.LoadInt ("stats_tPillCount", true);
	tCrystalCount = SaveGameManager.LoadInt ("stats_tCrystalCount", true);
	tReverserCount = SaveGameManager.LoadInt ("stats_tReverserCount", true);
	tAirBonusCount = SaveGameManager.LoadInt ("stats_tAirBonusCount", true);
	tPurgeCount = SaveGameManager.LoadInt ("stats_tPurgeCount", true);
	
	tAirRefilledCount = SaveGameManager.LoadInt ("stats_tAirRefilledCount", true);
	tButtonsPressedCount = SaveGameManager.LoadInt ("stats_tButtonsPressedCount", true);
	tPipesCreatedCount = SaveGameManager.LoadInt ("stats_tPipesCreateCount", true);
	tFallCount = SaveGameManager.LoadInt ("stats_tFallCount", true);
	tLargestAscent = SaveGameManager.LoadInt ("stats_tLargestAscent", true);
	tLargestFall = SaveGameManager.LoadInt ("stats_tLargestFall", true);
	tTimePlayed = SaveGameManager.LoadFloat ("stats_tTimePlayed", true);
	tTimeAboveCenter = SaveGameManager.LoadFloat ("stats_tTimeAboveCenter", true);
	tTimeBelowCenter = SaveGameManager.LoadFloat ("stats_tTimeBelowCenter", true);
}

/***************************************************************** GUI *****************************************************************/
function UpdateScreen () {
	
	/* This game */
	stats[0] = coinCount.ToString ();
	stats[1] = pillCount.ToString ();
	stats[2] = crystalCount.ToString ();
	stats[3] = reverserCount.ToString ();
	stats[4] = airBonusCount.ToString ();
	stats[5] = purgeCount.ToString ();
	stats[6] = (foundRoy) ? "Yes" : "No";
	stats[7] = airRefilledCount.ToString ();
	
	stats[8] = buttonsPressedCount.ToString ();
	stats[9] = pipesCreatedCount.ToString ();
	stats[10] = fallCount.ToString ();
	stats[11] = largestAscent.ToString () + " Rows";
	stats[12] = largestFall.ToString () + " Rows";
	stats[13] = FloatToTime (timePlayed);
	stats[14] = FloatToTime (timeAboveCenter);
	stats[15] = FloatToTime (timeBelowCenter);
	
	tCoinCount += (coinCount - startCoinCount);
	tPillCount += (pillCount - startPillCount);
	tCrystalCount += (crystalCount - startCrystalCount);
	tReverserCount += (reverserCount - startReverserCount);
	tAirBonusCount += (airBonusCount - startAirBonusCount);
	tPurgeCount += (purgeCount - startPurgeCount);
	tAirRefilledCount += (airRefilledCount - startAirRefilledCount);
	tButtonsPressedCount += (buttonsPressedCount - startButtonsPressedCount);
	tPipesCreatedCount += (pipesCreatedCount - startPipesCreatedCount);
	tFallCount += (fallCount - startFallCount);
	tTimePlayed += (timePlayed - startTimePlayed);
	tTimeAboveCenter += (timeAboveCenter - startTimeAboveCenter);
	tTimeBelowCenter += (timeBelowCenter - startTimeBelowCenter);
	
	/* Start counts */
	startCoinCount = coinCount;
	startPillCount = pillCount;
	startCrystalCount = crystalCount;
	startReverserCount = reverserCount;
	startAirBonusCount = airBonusCount;
	startPurgeCount = purgeCount;
	
	startAirRefilledCount = airRefilledCount;			
	startButtonsPressedCount = buttonsPressedCount;		
	startPipesCreatedCount = pipesCreatedCount;		
	startFallCount = fallCount;				
	startLargestAscent = largestAscent;			
	startLargestFall = largestFall;				
	startTimePlayed = timePlayed;
	startTimeAboveCenter = timeAboveCenter;
	startTimeBelowCenter = timeBelowCenter;
	
	/* Totals */
	bests[0] = tCoinCount.ToString ();
	bests[1] = tPillCount.ToString ();
	bests[2] = tCrystalCount.ToString ();
	bests[3] = tReverserCount.ToString ();
	bests[4] = tAirBonusCount.ToString ();
	bests[5] = tPurgeCount.ToString ();
	bests[6] = "";
	bests[7] = tAirRefilledCount.ToString ();
	
	bests[8] = tButtonsPressedCount.ToString ();
	bests[9] = tPipesCreatedCount.ToString ();
	bests[10] = tFallCount.ToString ();
	bests[11] = "";
	bests[12] = "";
	bests[13] = FloatToTime (tTimePlayed);
	bests[14] = FloatToTime (tTimeAboveCenter);
	bests[15] = FloatToTime (tTimeBelowCenter);
	
}

function FloatToTime (s : float) : String {
	
	var m : int = 0;
	var h : int = 0;
	
	while (s > 3600.0) {
		h ++;
		s -= 3600.0;
	}
	
	while (s > 60.0) {
		m ++;
		s -= 60.0;
	}
	
	return h.ToString() + ":" + m.ToString() + ":" + s.ToString("#");
}

function OnGUI () {
	if (!screenUp) return;
	DrawBackground ();
	DrawTitle ();
	DrawStats ();
}

function DrawBackground () {
	GUI.DrawTexture(fullScreen, texBlack, ScaleMode.StretchToFill, true, 0);
}

function DrawTitle () {
	GUIPlus.LabelWithShadow (titleRect, "Stats", titleStyle, CustomColor.white);
}

function DrawStats () {
	
	var breakPoint : int = 6;
	var valSpace : int = statStyle.CalcSize (new GUIContent ("Air bonuses collected__")).x;
	var bestSpace : int = statStyle.CalcSize (new GUIContent ("88:88:8_")).x; 
	var columnTitleOffset : int = statStyle.CalcSize (new GUIContent ("Game")).x / 3;
	
	for (var i : int = 0; i < statCount; i ++) {
		
		GUIPlus.LabelWithShadow (statRects[i], titles[i] + ":", statStyle, CustomColor.yellow);

		var valRect : Rect = statRects[i];
		valRect.x += valSpace;
		GUIPlus.LabelWithShadow (valRect, stats[i], statStyle, CustomColor.white);
		
		if (i == 0 || i == breakPoint + 2) {
			var c1 : Rect = valRect;
			c1.y = columnTitleY;
			c1.x -= columnTitleOffset;
			GUIPlus.LabelWithShadow (c1, "Game", statStyle, CustomColor.yellow);	
		}
		
		var bestRect : Rect = valRect;
		bestRect.x += bestSpace;
		GUIPlus.LabelWithShadow (bestRect, bests[i], statStyle, CustomColor.white);
		
		if (i == 0 || i == breakPoint + 2) {
			var c2 : Rect = bestRect;
			c2.y = columnTitleY;
			c2.x -= columnTitleOffset;
			GUIPlus.LabelWithShadow (c2, "Total", statStyle, CustomColor.yellow);	
		}
		
	}
}


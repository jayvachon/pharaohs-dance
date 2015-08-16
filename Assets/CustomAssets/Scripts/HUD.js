#pragma strict

/*	Meters	*/
var hudCam : Camera;

var circle : Texture2D;
var meterBackground : Texture2D;
var meterBackgroundFlipped : Texture2D;

var circleMeter : GameObject;
private var rpmMeter : GameObject;
private var rpmScript : CircleMeter;
private var airMeter : GameObject;
private var airScript : CircleMeter;

var startPointer : GameObject;
private var pointerL : GameObject;
private var pointerR : GameObject;
private var pointerU : GameObject;
private var pointerD : GameObject;

private var meterTop : float;
private var meterFontSize : float;
var meterFontScale : float = 1.0;

private var rpmColor : Color;

private var rpmPosition : Rect;
private var airPosition : Rect;
private var rpmTextPosition : Rect;
private var airTextPosition : Rect;

private var rpmTextDimensions : Vector2;
private var airTextDimensions : Vector2;

/*	Pill timer	*/
var timerTexture: Texture2D;
var timerShadow : Texture2D;
private var pillTimerWidth : float[] = new float[8];
private var pillTimerHeight : int = 20;

/*	Score	*/
var scoreEdgeL : Texture2D;
var scoreEdgeR : Texture2D;

var scoreStyle : GUIStyle;
var meterStyle : GUIStyle;
var title : GUIStyle;
var messageStyle : GUIStyle;
var scorePos : Rect;

/*	Jetpack timer	*/
private var jetpackTimer : int = 0;
private var jetpackTimerMax : int = 0;
private var jetpackPercent : float = 0.0;

private var messageFontSize : float;
var fontScale : float = 0.0;					// Used for animation

private var scoreText : String = "Coins: 0";	
private var scoreDimensions : Vector2;			

private var borderWidth : int = 20;
private var background : GUIStyle = new GUIStyle();
@HideInInspector
var backgroundAlpha : float = 0.75;
private var defaultBackgroundAlpha : float = 0.75;

/*	Collection Messages	*/
var mainCamera : GameObject;
private var cam : Camera;
private var collectionText : CollectionText[] = new CollectionText[20];
private var airMessage : int = 0; // When air is low, show messages to remind player

/*	Limited display   */
@System.NonSerialized
public var crystalUp : boolean = false;		// If the crystal screen is up, we only show a portion of the HUD
@System.NonSerialized
public var startScreen : boolean = true;

private var perfectCounter: int = 0;
private var titleCounter : int = 0;

// Window values
private var width : int;
private var height : int;
private var center : int;
private var middle : int;

private var scoreTop : int;

private var player : Player;
private var playerTransform : Transform;

/*	Height zones   */
private var heightZone : int = 0;
private var newScales : int[];

private var rows : int;

class CollectionText extends MonoBehaviour {
	
	private var text : String = "";
	private var position : Vector2 = Vector2(-1, -1);
	private var alpha : float = 1.0;
	private var fadeAmount : float = 0.1;
	private var color : Color;
	private var fontScale : float = 1.0;
	
	function CollectionText () {
		
	}
	
	function FlashText (t : String, p : Vector2, c : Color) {
		SetText(t);
		SetPosition(p);
		SetColor(c);
		alpha = 1.0;
		fontScale = 1.0;
		
		// ghetto substitutes for coroutines
		Invoke("Fade", 0.75);
		Invoke("Rise", Time.deltaTime * 0.5);
	}
	
	function FlashText (t : String, p : Vector2, c : Color, fScale : float) {
		SetText(t);
		SetPosition(p);
		SetColor(c);
		alpha = 1.0;
		fontScale = fScale;	// 1.5
		
		// ghetto substitute for coroutine
		Invoke("Fade", 1.5);
	}
	
	function Fade () {
		if (alpha > 0.0) {
			alpha -= fadeAmount;
			Invoke("Fade", Time.deltaTime);
		} else {
			Reset();
		}
	}
	
	function Rise () {
		if (alpha > 0.0) {
			position.y -= 3;
			Invoke("Rise", Time.deltaTime * 0.5);
		}
	}
	
	function Reset () {
		alpha = 0.0;
		text = "";
	}
	
	function ScreenCenter () : Vector2 {
		return Vector2(Screen.width / 2, Screen.height / 2);
	}
	
	function SetText (t : String) {
		text = t;
	}
	
	function SetPosition (p : Vector2) {
		position = p;
	}
	
	function SetColor (c : Color) {
		color = c;
	}
	
	function GetText () : String {
		return text;
	}
	
	function GetPosition () : Vector2 {
		return position;
	}
	
	function GetRect () : Rect {
		return Rect(position.x, position.y, 0.0, 0.0);
	}
	
	function GetAlpha () : float {
		return alpha;
	}
	
	function GetFontScale () : float {
		return fontScale;
	}
	
	function GetColor () : Color {
		var c : Color = color;
		c.a = GetAlpha();
		return c;
	}
	
	function DrawText () : boolean {
		return (alpha > 0.0);
	}
}

function Awake () {
	startScreen = true;
}

function Start () {

	rows = Wheel.rows;
	
	backgroundAlpha = defaultBackgroundAlpha;
	
	player = GameObject.FindGameObjectWithTag("Player").GetComponent(Player);
	playerTransform = GameObject.FindGameObjectWithTag("Player").transform;
	
	cam = mainCamera.GetComponent(Camera);
	for (var i = 0; i < collectionText.Length; i ++) {
		collectionText[i] = gameObject.AddComponent(CollectionText);
	}
	
	width = Screen.width;
	height = Screen.height;
	center = width / 2;
	middle = height / 2;
	
	for (i = 0; i < 8; i ++) {
		pillTimerWidth[i] = 0.0;
	}
	
	Messenger.instance.Listen("collect_coin", this);
	Messenger.instance.Listen("collect_bonus", this);
	Messenger.instance.Listen("update_score", this);
	Messenger.instance.Listen("open_screen", this);
	Messenger.instance.Listen("close_screen", this);
	Messenger.instance.Listen("lerp_time", this);
	Messenger.instance.Listen("change_time", this);
	Messenger.instance.Listen("update_air", this);
	Messenger.instance.Listen("player_fall", this);
	
	Messenger.instance.Listen("open_tutorial", this);
	Messenger.instance.Listen("close_tutorial", this);
	Messenger.instance.Listen("close_startscreen", this);
	Messenger.instance.Listen("open_startscreen", this);
	
	Messenger.instance.Listen("collect_airbonus", this);
	Messenger.instance.Listen("collect_reverser", this);
	
	Messenger.instance.Listen("collect_pill1", this);
	Messenger.instance.Listen("collect_pill2", this);
	Messenger.instance.Listen("collect_pill3", this);
	Messenger.instance.Listen("collect_pill4", this);
	Messenger.instance.Listen("collect_pill5", this);
	Messenger.instance.Listen("collect_pill6", this);
	Messenger.instance.Listen("collect_pill7", this);
	
	Messenger.instance.Listen("collect_crystal", this);
	Messenger.instance.Listen("collect_crystal0", this);
	Messenger.instance.Listen("collect_crystal1", this);
	Messenger.instance.Listen("collect_crystal2", this);
	Messenger.instance.Listen("collect_crystal3", this);
	Messenger.instance.Listen("collect_crystal4", this);
	Messenger.instance.Listen("collect_crystal5", this);
	Messenger.instance.Listen("collect_crystal6", this);
	Messenger.instance.Listen("collect_crystal7", this);
	
	Messenger.instance.Listen("collect_donut", this);
	
	Messenger.instance.Listen("end_pipe", this);
	Messenger.instance.Listen("refill_air", this);
	
	Messenger.instance.Listen("new_row", this);
	
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
	
	
	scoreTop = height / 32;
	scorePos = CenteredRect(center, scoreTop, 0, 0);
	
	/* Font sizes */
	
	var maxWidth : float = 1152.0;
	var ratio : float = Mathf.Lerp(0.0, 1.0, (Screen.width + 0.0) / maxWidth);
	scoreStyle.fontSize *= ratio;
	title.fontSize *= ratio;
	
	meterStyle.fontSize *= ratio;
	meterFontSize = meterStyle.fontSize;
	
	messageStyle.fontSize *= ratio;
	messageFontSize = messageStyle.fontSize;
	
	////////////////
	
	pillTimerHeight *= ratio;
	
	var scoreDim : Vector2 = UpdateScore();
	var scoreWidthPercent : float = (scoreDim.x + 0.0) / (width + 0.0);
	background.normal.background = CreateNewTexture(CustomColor.white);
	
	var backColor : Color = CustomColor.black;
	backColor.a = 0.0;
	
	var meterRadius : int = scoreDim.y + 2;
	
	meterTop = 1.0 - ((scoreTop + 0.0) / (height + 0.0));
	meterTop = meterTop - (((meterRadius + 0.0) / 2.0) / (height + 0.0));
	
	rpmMeter = GameObject.Instantiate(circleMeter, Vector3.zero, Quaternion.identity);
	rpmScript = rpmMeter.GetComponent(CircleMeter);
	rpmScript.SetMeterCircular(false);
	rpmScript.SetPosition(0.5 + scoreWidthPercent, meterTop);
	rpmPosition = Rect(center + scoreDim.x - (meterRadius / 2), scoreTop, meterRadius * 2, meterRadius);
	rpmScript.SetColor(backColor, CustomColor.red);
	rpmColor = CustomColor.red;
	rpmScript.SetPercentage(0);
	rpmTextDimensions = meterStyle.CalcSize(new GUIContent("Alt."));
	
	airMeter = GameObject.Instantiate(circleMeter, Vector3.zero, Quaternion.identity);
	airScript = airMeter.GetComponent(CircleMeter);
	airScript.SetPosition(0.5 - scoreWidthPercent, meterTop);
	airScript.pulseWhenLow = true;
	airPosition = Rect(center - (scoreDim.x + (meterRadius * 2)) + (meterRadius / 2), scoreTop, meterRadius * 2, meterRadius);
	airScript.SetColor(backColor, CustomColor.white);
	airTextDimensions = meterStyle.CalcSize(new GUIContent("Air"));
	
	//airScript.BeginPulse(CustomColor.red);
	
	var meterWidth : int = 50;
	
	rpmTextPosition = Rect(center + scoreDim.x + meterWidth, scoreTop + (scoreDim.y / 2), 0, 0);
	airTextPosition = Rect(center - (scoreDim.x + meterWidth), scoreTop + (scoreDim.y / 2), 0, 0);
	
	pointerL = GameObject.Instantiate(startPointer, Vector3.zero, Quaternion.identity);
	pointerL.GetComponent(StartPointer).Initiate(true, false, false);
	pointerR = GameObject.Instantiate(startPointer, Vector3.zero, Quaternion.identity);
	pointerR.GetComponent(StartPointer).Initiate(false, false, false);
	
	pointerU = GameObject.Instantiate(startPointer, Vector3.zero, Quaternion.identity);
	pointerU.GetComponent(StartPointer).Initiate(false, true, true);
	pointerD = GameObject.Instantiate(startPointer, Vector3.zero, Quaternion.identity);
	pointerD.GetComponent(StartPointer).Initiate(false, true, false);
	
	newScales = new int[6];
	var interval : int = Wheel.rows / 6;
	for (i = 0; i < newScales.Length; i ++) {
		newScales[i] = (interval * i) - 1;
	}
	
}

function CreateNewTexture (col : Color) : Texture2D {
	var t : Texture2D;
	t = new Texture2D(1, 1);
	t.SetPixel(0, 0, col);
	t.wrapMode = TextureWrapMode.Repeat;
	t.Apply();
	return t;
}

function OnGUI () {
	
	if (startScreen)
		return;
		
	GUI.depth = 0;
		
	if (!crystalUp) {		
		DrawAir();
		DrawRPM();
		hudCam.Render();
	}

	// Draw score
	//var scorePos: Rect = CenteredRect(center, scoreTop, 0, 0);
	
	// Text score
	DrawScoreText(scorePos);
	
	// Pill timers
	DrawPillTimer();
	
	DrawMessage();
	DrawCollectionText();
			
}

function CenteredRect (x : int, y : int, w : float, h : float) : Rect {
	return Rect(x - (w / 2), y - (h / 2), w, h);
}

function DrawAir () {
	
	GUI.color = CustomColor.black;
	GUI.color.a = backgroundAlpha;
	GUI.DrawTexture(airPosition, meterBackgroundFlipped, ScaleMode.ScaleToFit);
	
	//meterStyle.fontSize = meterFontSize * meterFontScale;
	meterStyle.alignment = TextAnchor.MiddleRight;
	LabelWithShadow(airTextPosition, "Air", meterStyle, Color.white);
}

function DrawRPM () {

	GUI.color = CustomColor.black;
	GUI.color.a = backgroundAlpha;
	GUI.DrawTexture(rpmPosition, meterBackground, ScaleMode.ScaleToFit);
	
	//meterStyle.fontSize = meterFontSize;
	meterStyle.alignment = TextAnchor.MiddleLeft;
	LabelWithShadow(rpmTextPosition, "Alt.", meterStyle, Color.white);
}

function DrawScoreText (position : Rect) {
	
	DrawScoreBackground();
	
	scoreStyle.alignment = TextAnchor.UpperCenter;
	LabelWithShadow(position, scoreText, scoreStyle, Color.yellow);

}

function DrawScoreBackground () {
	
	GUI.color = CustomColor.black;
	GUI.color.a = backgroundAlpha;
	var width : int = scoreDimensions.x;
	var height : int = scoreDimensions.y;
	var x : int = center - (width / 2);
	var y : int = scoreTop;
	var side : int = height / 2.0;
	
	GUI.DrawTexture(Rect(x - side, y, side, height), scoreEdgeL, ScaleMode.StretchToFill);
	GUI.DrawTexture(Rect(x + width, y, side, height), scoreEdgeR, ScaleMode.StretchToFill);
	GUI.Label(Rect(x, y, width, height), "", background);
	
}

function DrawPillTimer () {
	
	if (!crystalUp) {
		var top : int = scoreTop + scoreDimensions.y + (pillTimerHeight / 2.0);
		var width : int = scoreDimensions.x + 80;	
		for (var i = 0; i < 8; i ++) {
			
			var c : Color = CustomColor.colorProgression[i];
			pillTimerWidth[i] = Mathf.Lerp(pillTimerWidth[i], TimeController.periodPositions[i], Time.deltaTime * 2.0);
			var w = width * pillTimerWidth[i];
			RectangleWithShadow(Rect(center - (w / 2), top, w, pillTimerHeight), timerTexture, c);

		}
	}
		
}

function DrawJetpackTimer () {
	/*if (!crystalUp && jetpackTimerMax > 0) {
		var side : int = 40;
		var top : int = scoreTop + (textDimensionsL.y / 4);
		var right : int = center + textDimensionsR.x + (side * 2);
		var left : int = center - textDimensionsL.x - (side * 2);
		
		var rw : int = (center - textDimensionsR.x - (side * 3)) * jetpackPercent;
		var lw : int = (center - textDimensionsL.x - (side * 3)) * jetpackPercent;
		var w : int = (((width + 0.0) / 3.0) * (jetpackPercent));
		var h : int = textDimensionsL.y / 2;
		
		RectangleWithShadow(Rect(right, top, rw, h), timerTexture, CustomColor.yellow);
		RectangleWithShadow(Rect(left, top, -lw, h), timerTexture, CustomColor.yellow);
		
	}*/
}

function RectangleWithShadow (pos : Rect, tex : Texture2D, col : Color) {
	var p : Rect = pos;
	p.x += 2;
	p.y += 2;
	GUI.color = CustomColor.black;
	GUI.DrawTexture(p, timerShadow, ScaleMode.StretchToFill);
	GUI.color = col;
	GUI.DrawTexture(pos, tex, ScaleMode.StretchToFill);
}

function DrawMessage () {
	messageStyle.fontSize = messageFontSize * fontScale;
	if (messageStyle.fontSize > 0) {
		//LabelWithShadow(Rect(center, middle, 0, 0), "Stomach full!", messageStyle, Color.white);
	}
}

function ShowMessage () {
	animation.Play("MessagePulse");
}

function LabelWithShadow (pos : Rect, text : String, style : GUIStyle, col : Color) {
	
	var p : Rect = pos;
	p.x += 2;
	p.y += 2;
	
	var shadowAlpha : float = col.a;
	if (shadowAlpha < 1.0) {
		shadowAlpha *= 0.5;
	}
	
	GUI.color = Color.black;
	GUI.color.a = shadowAlpha;
	GUI.Label(p, text, style);
	
	GUI.color = col;
	GUI.Label(pos, text, style);
	
}

function Label (pos : Rect, text : String, style : GUIStyle, col : Color) {
	
	//var p : Rect = pos;
	
	GUI.color = col;
	GUI.Label(pos, text, style);
	
}

function DrawCollectionText () {
	for (var i = 0; i < collectionText.Length; i ++) {
		if (collectionText[i].DrawText()) {
			messageStyle.fontSize = messageFontSize * collectionText[i].GetFontScale();
			LabelWithShadow(collectionText[i].GetRect(), collectionText[i].GetText(), messageStyle, collectionText[i].GetColor());
		}
	}
}

function AddCollectionText (text : String, color : Color) {
	var pos : Vector2 = GetCollectionPoint();
	for (var i = 0; i < collectionText.Length; i ++) {
		if (collectionText[i].GetText() == "") {
			collectionText[i].FlashText(text, Vector2(pos.x, pos.y + (i * (messageStyle.fontSize * 1.2))), color);
			break;
		}
		if (i == collectionText.Length - 1) {
			collectionText[0].FlashText(text, pos, color);
		}
	}
}

function AddCollectionText (text : String, color : Color, center : boolean) {

	var pos : Vector2 = collectionText[0].ScreenCenter ();
	var offset : int = 0;
	for (var i = 0; i < collectionText.Length; i ++) {
		if (collectionText[i].GetText != "" && collectionText[i].GetFontScale == 1.5) {
			offset ++;
		}
		if (collectionText[i].GetText() == "") {
			collectionText[i].FlashText(text, Vector2 (pos.x, pos.y + (offset * (messageStyle.fontSize * 0.9))), color, 1.5);
			break;
		}
		if (i == collectionText.Length - 1) {
			collectionText[0].FlashText(text, pos, color, 1.5);
		}
	}
}

function GetCollectionPoint () {
	var screenPoint : Vector3 = cam.WorldToScreenPoint(playerTransform.position);
	return Vector2(screenPoint.x, screenPoint.y);
}

function _CollectCoin () {
	UpdateScore();
	AddCollectionText ("1", CustomColor.yellow);
}

function _CollectBonus () {
	UpdateScore();
}

function _UpdateScore () {
	var s : Vector2 = UpdateScore();
	UpdateRPMPosition(s);
	UpdateAirPosition(s);
}

function UpdateScore () {
	var intervals : int[] = [ StringLength(": "), StringLength(": 1"), StringLength(": 00"), StringLength(": 000"), StringLength(": 0000"), StringLength(": 00000") ];
	var currentInterval : int;
	for (var i = 5; i > -1; i --) {
		if (scoreDimensions.x > intervals[i]) {
			currentInterval = i;
			break;
		}
	}
	
	scoreText = "Coins: " + Score.coinCount.ToString();
	var newSize : Vector2 = scoreStyle.CalcSize(new GUIContent(scoreText)) + Vector2(borderWidth, 0);
	for (var j = 5; j > -1; j --) {
		if (Mathf.Abs(newSize.x) > intervals[j] && j != currentInterval) {
			StartCoroutine(ResizeBackground(0.25, newSize));
			break;
		}
	}
	
	return newSize;
}

function UpdateRPMPosition (scoreSize : Vector2) {

	var meterRadius : int = scoreSize.y + 2;
	var meterWidth : int = 50;
	rpmPosition.x = center + scoreSize.x - (meterRadius / 2);
	rpmTextPosition.x = center + scoreSize.x + meterWidth;
	
	var scoreWidthPercent : float = (scoreSize.x + 0.0) / (width + 0.0);
	//var meterTop : float = 1.0 - ((scoreTop + 0.0) / (height + 0.0));
	rpmScript.SetPosition(0.5 + scoreWidthPercent, meterTop);
	
}

function UpdateAirPosition (scoreSize : Vector2) {

	var meterRadius : int = scoreSize.y + 2;
	var meterWidth : int = 50;
	airPosition.x = center - (scoreSize.x + (meterRadius * 2)) + (meterRadius / 2);
	airTextPosition.x = center - (scoreSize.x + meterWidth);
	
	var scoreWidthPercent : float = (scoreSize.x + 0.0) / (width + 0.0);
	//var meterTop : float = 1.0 - ((scoreTop + 0.0) / (height + 0.0));
	airScript.SetPosition(0.5 - scoreWidthPercent, meterTop);
	
}

function ResizeBackground (time : float, newSize : Vector2) {
	var elapsedTime : float = 0.0;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		scoreDimensions = Vector2.Lerp(scoreDimensions, newSize, elapsedTime / time);
		yield;
	}
}

function StringLength (s : String) {
	return Mathf.RoundToInt((scoreStyle.CalcSize(new GUIContent(s)) + Vector2(borderWidth, 0)).x);
}

function _OpenTutorial () {
	startScreen = true;
}

function _CloseTutorial () {
	startScreen = false;
}

function _OpenScreen () {
	backgroundAlpha = 1.0;
	crystalUp = true;
}

function _CloseScreen () {
	backgroundAlpha = defaultBackgroundAlpha;
	crystalUp = false;
}

function _CloseStartscreen () {
	yield WaitForFixedUpdate ();
	startScreen = false;
}

function _OpenStartscreen () {
	startScreen = true;
}

/*function _UpdateJetpacktimer () {
	jetpackTimer = player.jetpackTimer;
	jetpackTimerMax = player.jetpackTimerMax;
	if (jetpackTimerMax > 0) {
		var newPercent : float = ((jetpackTimer + 0.0) / (jetpackTimerMax + 0.0));
		//Debug.Log(newPercent);
		LerpPercent(0.25, newPercent);
	}
}*/

function _AddCrystal () {
	if (Inventory.instance.IsStomachFull()) {
		ShowMessage();
	}
}

function LerpPercent (time : float, newPercent : float) {
	var elapsedTime : float = 0.0;
	var startPercent : float = jetpackPercent;
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		jetpackPercent = Mathf.Lerp(startPercent, newPercent, elapsedTime / time);
		yield;
	}
}

function _NewRow () {

	var row = (Wheel.playerRow + 1.0) / (rows + 0.0);
	var py : boolean = (playerTransform.position.y > 0);
	
	if (py) {
		if (Wheel.playerRow < 1)
			row = 0;
	} 
		
	yield LerpHeight(rpmScript.GetPercentage(), row, !py);

	var c : Color = CustomColor.colorProgression[
												Mathf.Clamp(
												Mathf.FloorToInt(
												((Wheel.playerRow + 0.0) / (rows + 0.0))
												* newScales.Length),
												0, 6)
												];
	if (!py)
		c = CustomColor.colorProgression[0];
		
	rpmScript.SetIndicatorColor (c);
}

function LerpHeight (startPercent : float, endPercent : float, flip : boolean) {
	
	if (flip)
		rpmScript.FlipVerticalMeter(flip);
	
	var time : float = 0.25;
	var eTime : float = 0.0;
	while (eTime < time) {
		eTime += Time.deltaTime;
		rpmScript.SetPercentage (Mathf.Lerp(startPercent, endPercent, eTime / time));
		yield;
	}
	
	if (!flip)
		rpmScript.FlipVerticalMeter(flip);
	
}

function _UpdateAir () {

	airScript.SetPercentage(player.air);
	
	if (player.air > 0.5) {
		airMessage = 0;
		//new MessageAirNormal ();
		return;
	}
	
	if (player.air <= 0.25 && airMessage == 0) {
		ShowGetAir("Get Air!", CustomColor.white);
		new MessageGetAir ();
		airMessage ++;
	}
	
	if (player.air <= 0.15 && airMessage == 1) {
		ShowGetAir("Get Air!", CustomColor.white);
		new MessageGetAir ();
		airMessage ++;
	}
	
	if (player.air <= 0.1 && airMessage == 2) {
		ShowGetAir("AIR CRITICAL!", CustomColor.yellow);
		new MessageAirCritical ();
		airMessage ++;
	}
	
	if (player.air <= 0.05 && airMessage == 3) {
		ShowGetAir("AIR CRITICAL!!!", CustomColor.red);
		new MessageAirCritical ();
		airMessage ++;
	}

}

function ShowGetAir (t : String, c : Color) {
	AddCollectionText (t, c, true);
}

function _RefillAir () {
	//airMessage = 0;
	AddCollectionText ("Air Tank Refilled!", CustomColor.white);
}

function _CollectReverser () {
	AddCollectionText ("Wheel Reversed!", CustomColor.colorProgression[2]);
}

function _CollectAirbonus () {
	AddCollectionText ("Air Tank Refilled!", CustomColor.white);
}

// Pills
function _CollectPill1 () {
	AddCollectionText ("50% Time", CustomColor.colorProgression[1]);
}

function _CollectPill2 () {
	AddCollectionText ("40% Time", CustomColor.colorProgression[2]);
}

function _CollectPill3 () {
	AddCollectionText ("30% Time", CustomColor.colorProgression[3]);
}

function _CollectPill4 () {
	AddCollectionText ("20% Time", CustomColor.colorProgression[4]);
}

function _CollectPill5 () {
	AddCollectionText ("10% Time", CustomColor.colorProgression[5]);
}

function _CollectPill6 () {
	AddCollectionText ("0% Time", CustomColor.colorProgression[6]);
}

function _CollectPill7 () {
	AddCollectionText ("-150% Time", CustomColor.colorProgression[7] + CustomColor.grey);
}

// Crystals
function _CollectCrystal () {
	yield WaitForFixedUpdate();
	if (Inventory.instance.IsStomachFull()) {
		AddCollectionText ("Stomach Full!", CustomColor.white, true);
	}
}

function _CollectCrystal0 () {
	AddCollectionText ("DRUNKLE ROY DROPS 50G!!!!", CustomColor.colorProgression[0], true);
}

function _CollectCrystal1 () {
	AddCollectionText ("10", CustomColor.colorProgression[1]);
}

function _CollectCrystal2 () {
	AddCollectionText ("25", CustomColor.colorProgression[2]);
}

function _CollectCrystal3 () {
	AddCollectionText ("50", CustomColor.colorProgression[3]);
}

function _CollectCrystal4 () {
	AddCollectionText ("100", CustomColor.colorProgression[4]);
}

function _CollectCrystal5 () {
	AddCollectionText ("250", CustomColor.colorProgression[5]);
}

function _CollectCrystal6 () {
	AddCollectionText ("1000", CustomColor.colorProgression[6]);
}

function _CollectCrystal7 () {
	AddCollectionText ("STOMACH PURGED", CustomColor.colorProgression[7] + CustomColor.grey);
}

// Donut
function _CollectDonut () {
	yield WaitForFixedUpdate();
	var count : int = Inventory.instance.GetLastCollectedDonut();
	
	AddCollectionText ("Donut " + count.ToString() + " of 6", CustomColor.colorProgression[count]);
}

// Height zones
function _EndPipe () {

	var newRow : int = Wheel.instance.playerRow;
	var newHeight : boolean = false;
	
	if (playerTransform.position.y > 0.0) {
		for (var i = heightZone + 1; i < newScales.Length; i ++) {
			if (newRow > newScales[i]) {
				heightZone = i;
				newHeight = true;
			}
		}
	}
	
	if (heightZone > 0 && newHeight) {
		new MessageTierReached ();
		AddCollectionText("Tier " + heightZone + " Reached!", CustomColor.colorProgression[heightZone], true);
	}
	
}

function _RestartGame () {
	heightZone = 0;
}

// Player fall

function _PlayerFall () {
	AddCollectionText ("Oops!", CustomColor.white);
}

function _SaveGame () {
	AddCollectionText ("Game Saved!", CustomColor.yellow);
	SaveGameManager.SaveInt ("hud_heightZone", heightZone);
}

function _LoadGame () {
	heightZone = SaveGameManager.LoadInt ("hud_heightZone");
}
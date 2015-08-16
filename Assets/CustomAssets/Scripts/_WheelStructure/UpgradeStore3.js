#pragma strict

var demo : boolean = true;
public var select : GameObject;
private var selectPitch : FXPitch;

var texTextBack : Texture2D;
var texTextEdgeL : Texture2D;
var texTextEdgeR : Texture2D;

var descriptionStyle : GUIStyle;
var uBoxStyle : GUIStyle;
var mBarStyle : GUIStyle;
private var screenUp : boolean = false;
private var canOpen : boolean = true;		// We wait a couple seconds before allowing the screen to be re-opened

// Player components
private var input : FPSInputController;
private var motor : CharacterMotor;
private var controller : CharacterController;
private var player : Transform;

// Window dimensions
private var width : int;
private var height : int;
private var center : int;
private var middle : int;

// Dimensions of the screen we're drawing in
private var screenWidth : int;
private var screenHeight : int;
private var top : int;
private var bottom : int;
private var right : int;
private var border : int;

// Rects
private var backgroundBox : Rect;

// Textures
private var texBlack : Texture2D;
private var texYellow : Texture2D;
private var texWhite : Texture2D;
private var texRed : Texture2D;
private var texGrey : Texture2D;

// Descriptions
private var descriptionMain : String = "Buy upgrades and become less of a weakling. Space selects. Escape leaves.";
private var uDescription : String[] = [ "Fall a bit slower.",
										//"Press buttons quicker.",
										//"Attract coins and bonuses more effectively.",
										//"Jump higher.",
										"Hold more air in your air tank.",
										"Hold more crystals.",
										"Increase the effectiveness of pills." ];

private var descriptionText : String = "Buy upgrades and become less of a weakling. Space selects. Escape leaves.";


// Upgrade boxes
private var uBoxFontSize : int;
private var uBoxSize : Vector2;
									 // Titles
private var uBoxTitle : String[] = [ "Parachute", 
									 //"Heaviness", 
									 //"Magnet", 
									 //"Jump Size", 
									 "Air Tank", 
									 "Stomach Size", 
									 "Pill Duration" ];		
							
private var uTextDimensions : Vector2[];	// Height & width of titles
private var uBoxScale : float[];			// sizes that boxes scroll through
private var uBoxPos : Vector2[];			// position of boxes
private var uBox : Rect[];					// position & size of boxes 
private var uBoxCount : int;				// number of upgrades (effectively the array length from above)
private var uBoxScrollPosition : int = 0; 	// Our position within the menu 
private var centerUBox : int = 1;			// The upgrade box currently in the center

private var nextUpgradePrice : int[];

var uScale : float = 1.0;					// Overall scale of the upgrade screen

// Option boxes
private var optionScreenUp : boolean = false;
private var optionUBoxPosition : Vector2; 	// When we're in the option screen, this is the location of the selected upgrade box
private var optionWidth : int;				// Width of the space where the option boxes are drawn

private var oBoxTitle = 	[ 
								[ "Tiny", "Small", "Medium", "Large", "Giant" ],	// Parachute
								//[ "2lb", "5lb", "10lb", "25lb", "45lb" ],			// Heaviness
								//[ "Tiny", "Small", "Medium", "Large", "Giant" ],	// Magnet
								//[ "1ft", "2ft", "3ft", "4ft", "5ft" ],				// Jump Size
								[ "75sec", "90sec", "120sec", "180sec", "240sec" ],	// Air
								[ "5", "7", "10", "15", "25" ],						// Stomach Size
								[ "12sec", "15sec", "20sec", "25sec", "30sec" ]		// Pill duration
							];
						
private var oBoxPrice =		[ 
								[ 125, 450, 750, 2000, 5000 ],			// Parachute					| 125, 650, 2500, 5000, 7500 
								//[ 150, 1000, 3000, 6000, 8500 ],			// Heaviness				| 
								//[ 350, 500, 2500, 5000, 10000 ],			// Magnet					| 
								//[ 100, 250, 500, 2500, 5000 ],			// Jump Size				| 
								[ 150, 500, 1200, 3000, 7500 ],		// Air							| 150, 750, 3000, 6000, 12000
								[ 75, 350, 1000, 2500, 6000 ],			// Stomach size					| 75, 500, 2000, 4000, 75000
								[ 250, 650, 1500, 3500, 8000 ]			// Pill duration				| 250, 1000, 4000, 7500, 12000
							];

private var oBoxPurchased : int[];			// Grabs values from inventory and greys out options that have already been purchased

private var oBoxSize : Vector2;
private var oBoxPos : Vector2[];
private var oBox : Rect[];
private var oBoxCount : int;
private var oBoxBorder : int = 20;
private var oBoxScrollPosition : int = 0;

private var oBackground : Rect;
var oBackgroundScale : float = 0.0;
var oScale : float = 1.0;					// Used for animation
var oPulse : float = 1.0;

// Back button
private var oBackSize : Vector2;
private var oBackPos : Vector2;
private var oBackRect : Rect;
private var oBackSelected : boolean = false;

// Message bar
private var mBarMessage : String;
private var mBarPos : Vector2;
private var mBarSize : Vector2;
private var mBarRect : Rect;
var mScale : float = 0.0;

// Navigation
private var repositioning : boolean = false;

function Start () {

	selectPitch = select.GetComponent (FXPitch);
	
	GetPlayerComponents();
	GetWindowDimensions();
	SetScreenDimensions(0.825);
	CreateBackground();
	
	// Upgrade boxes
	SetUBoxSize(4.0, 2.0);
	SetUBoxCount();
	SetUBoxScales();
	SetUBoxPositions();
	SetUBoxRects();
	
	uBoxFontSize = uBoxStyle.fontSize;
	var maxWidth = 1152;
	uBoxFontSize *= Mathf.Lerp(0.0, 1.0, (Screen.width + 0.0) / (maxWidth + 0.0));
	uBoxStyle.fontSize = uBoxFontSize;
	
	descriptionStyle.fontSize *= Mathf.Lerp(0.0, 1.0, (Screen.width + 0.0) / (maxWidth + 0.0));
	
	SetUTextDimensions();
	
	// Option boxes
	optionUBoxPosition = Vector2(right + border + (uBoxSize.x / 2), middle);
	SetOBoxCount();
	SetOptionWidth();
	SetOBoxSize(5.0);
	SetOBoxPositions();
	SetOBoxRects();	
	SetOBackground();
	
	InitializeOBoxPurchased();
	
	SetNextUpgradePrice();
	
	// Back button
	SetOBackSize();
	SetOBackPosition();
	SetOBackRect();
	
	// Message bar
	SetMBarRect();
	SetMBarPosition();
	SetMBarSize();
	
	CreateTextures();
	
	Messenger.instance.Listen("update_inventory", this);
	Messenger.instance.Listen("restart_game", this);
	
	animation.Play("UScaleSet");
	animation.Play("OScaleSet");
	animation.Play("MScaleSet");
	
	animation["OPulse"].layer = 2;
	animation["MScaleGrow"].layer = 3;
	animation["MScaleShrink"].layer = 3;
}

function GetPlayerComponents () {
	player = GameObject.Find("Player").transform;
	input = player.GetComponent(FPSInputController);
	motor = player.GetComponent(CharacterMotor);
	controller = player.GetComponent(CharacterController);
}

function GetWindowDimensions () {
	width = Screen.width;
	height = Screen.height;
	center = width / 2;
	middle = height / 2;
}

function SetScreenDimensions (percent : float) {
	screenWidth = width * percent;
	screenHeight = height * percent;
	
	top = middle - (screenHeight / 2);
	bottom = middle + (screenHeight / 2);
	right = center - (screenWidth / 2);
	border = ((screenHeight / 10) + (screenWidth / 10)) / 2; // Border is an average of screen width & height
}

function CreateBackground () {
	backgroundBox = CenteredRect(center, middle, screenWidth, screenHeight);
}

function CreateTextures () {
	texBlack = CreateTextureFromColor(CustomColor.black);
	texYellow = CreateTextureFromColor(CustomColor.yellow);
	texWhite = CreateTextureFromColor(CustomColor.white);
	texRed = CreateTextureFromColor(CustomColor.red);
	texGrey = CreateTextureFromColor(CustomColor.dkgrey);
}

// --------------------------------------------- Upgrade boxes --------------------------------------------- //

function SetUBoxSize (w : float, h : float) {
	uBoxSize = Vector2((screenWidth + 0.0) / w, (screenHeight + 0.0) / h);
}

function SetUBoxCount () {
	uBoxCount = uBoxTitle.Length;
}

function SetUBoxScales () {
	uBoxScale = new float[uBoxCount];
	uBoxScale[0] = 0.5;
	uBoxScale[1] = 1.0;
	uBoxScale[2] = 0.5;
	for (var i = 3; i < uBoxCount; i ++) {
		uBoxScale[i] = 0;
	}
}

function SetUBoxPositions () {
	uBoxPos = new Vector2[uBoxCount];
	uBoxPos[0] = Vector2(center - (uBoxSize.x * uBoxScale[0] * 2), middle);
	uBoxPos[1] = Vector2(center, middle);
	uBoxPos[2] = Vector2(center + (uBoxSize.x * uBoxScale[2] * 2), middle);
	
	for (var i = 3; i < uBoxCount; i ++) {
		uBoxPos[i] = Vector2(center, middle + 1);
	}
}

function SetUBoxRects () {
	uBox = new Rect[uBoxCount];
	for (var i = 0; i < uBoxCount; i ++) {
		uBox[i] = CenteredRect(uBoxPos[i].x, uBoxPos[i].y, uBoxSize.x * uBoxScale[i], uBoxSize.y * uBoxScale[i]);
	}
}

function SetUTextDimensions () {
	uTextDimensions = new Vector2[uBoxCount];
	for (var i = 0; i < uBoxCount; i ++) {
		uTextDimensions[i] = uBoxStyle.CalcSize(new GUIContent(uBoxTitle[i]));
	}
}

function SetNextUpgradePrice () {
	nextUpgradePrice = new int[uBoxCount];
	for (var i = 0; i < uBoxCount; i ++) {
		nextUpgradePrice[i] = oBoxPrice[i][0];
	}
}

function ResetNextUpgradePrice () {
	for (var i = 0; i < uBoxCount; i ++) {
		nextUpgradePrice[i] = oBoxPrice[i][0];
	}
}

// --------------------------------------------- Option boxes --------------------------------------------- //

function SetOptionWidth () {
	optionWidth = (screenWidth - (uBoxSize.x + (border * 2) + (oBoxCount * oBoxBorder)));
}

function SetOBoxCount () {
	oBoxCount = 5;
}

function SetOBoxSize (h : int) {
	var w : int = optionWidth / oBoxCount;
	oBoxSize = Vector2(w, screenHeight / h);
}

function SetOBoxPositions () {
	oBoxPos = new Vector2[oBoxCount];
	var y : int = middle;
	var right : int = optionUBoxPosition.x + (uBoxSize.x / 2) + (oBoxSize.x / 2) + oBoxBorder;
	for (var i = 0; i < oBoxCount; i ++) {
		oBoxPos[i] = Vector2(right + (i * oBoxSize.x + (i * oBoxBorder)), y);
	}
}

function SetOBoxRects () {
	oBox = new Rect[oBoxCount];
	for (var i = 0; i < oBoxCount; i ++) {
		oBox[i] = CenteredRect(oBoxPos[i].x, oBoxPos[i].y, oBoxSize.x, oBoxSize.y);
	}
}

function SetOBackground () {
	oBackground = CenteredRect(center, middle, screenWidth, screenHeight);
}

function InitializeOBoxPurchased () {
	oBoxPurchased = new int[uBoxCount];
	for (var i = 0; i < uBoxCount; i ++) {
		oBoxPurchased[i] = 0;
	}
}

// --------------------------------------------- Back button --------------------------------------------- //

function SetOBackSize () {
	var h : int = ((uBoxSize.y - oBoxSize.y) / 2) - (oBoxBorder * 2);
	oBackSize = Vector2(oBoxSize.x, h);
}

function SetOBackPosition () {
	var y : int = ((uBoxSize.y - oBoxSize.y) / 2) + oBoxBorder;
	oBackPos = Vector2(oBoxPos[0].x, middle + y);
}

function SetOBackRect () {
	oBackRect = CenteredRect(oBackPos.x, oBackPos.y, oBackSize.x, oBackSize.y);
}

// --------------------------------------------- Message Bar --------------------------------------------- //

function SetMBarRect () {
	var right : int = oBox[0].x;
	var width : int = (oBox[oBoxCount - 1].x + oBox[oBoxCount - 1].width) - right;
	var top : int = middle - (oBoxSize.y / 2) - oBoxBorder - oBackSize.y;
	var height : int = oBackSize.y;
	mBarRect = Rect(right, top, width, height);
}

function SetMBarPosition () {
	mBarPos = Vector2(mBarRect.x + (mBarRect.width / 2), mBarRect.y + (mBarRect.height / 2));
}

function SetMBarSize () {
	mBarSize = Vector2(mBarRect.width, mBarRect.height);
}

// --------------------------------------------- Custom GUI functions --------------------------------------------- //

function CreateTextureFromColor (col : Color) : Texture2D {
	var t : Texture2D;
	t = new Texture2D(1, 1);
	t.SetPixel(0, 0, col);
	t.wrapMode = TextureWrapMode.Repeat;
	t.Apply();
	return t;
}

function CenteredRect (x : int, y : int, w : float, h : float) : Rect {
	return Rect(x - (w / 2), y - (h / 2), w, h);
}

function CenteredRect (r : Rect) : Rect {
	return Rect(r.x - (r.width / 2), r.y - (r.height / 2), r.width, r.height);
}

function GetRectCenter (r : Rect) : Vector2 {
	return Vector2(r.x + (r.width / 2), r.y + (r.height / 2));
}

function LabelWithShadow (pos : Rect, text : String, style : GUIStyle, col : Color, shadowCol : Color) {
	
	var p : Rect = pos;
	p.x += 2;
	p.y += 2;
	GUI.color = shadowCol;
	GUI.Label(p, text, style);
	
	GUI.color = col;
	GUI.Label(pos, text, style);

}

// --------------------------------------------- Opening & Closing --------------------------------------------- //

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Net") {
		OpenScreen();
	}
}

function OpenScreen () {
	if (canOpen) {
		input.stop = true;
		yield WaitForStop();
		input.enabled = false;
		screenUp = true;
		motor.enabled = false;
		new MessageOpenScreen();
	}
}

function CloseScreen () {
	motor.enabled = true;
	input.enabled = true;
	input.stop = false;
	screenUp = false;
	new MessageCloseScreen();
	canOpen = false;
	yield WaitForSeconds(0.5);
	canOpen = true;
}

function WaitForStop () {
	while (controller.velocity != Vector3.zero) {
		yield;
	}
}

// --------------------------------------------- Navigation --------------------------------------------- //

function Update () {
	if (screenUp) {
		if (Input.GetButtonDown("Action1")) {
			//Score.instance.AddScore(5000);
		}
		if (Input.GetKeyDown(KeyCode.Escape)) {
			if (optionScreenUp) {
				PlaySelect (2);
				CloseOptionScreen();
			} else {
				//PlaySelect (0);
				CloseScreen();
			}
		}
		if (Input.GetButtonDown("MenuClose")) {
			if (optionScreenUp) {
				PlaySelect (2);
				CloseOptionScreen();
			} else {
				//PlaySelect (0);
				CloseScreen();
			}
		}
		
		if (Input.GetButtonDown("MenuLeft")) {
			PlayScroll ();
			if (optionScreenUp) {
				ScrollOBox(-1);
			} else {
				ScrollUBox(-1);
			}
		}
		
		if (Input.GetButtonDown("MenuRight")) {
			PlayScroll ();
			if (optionScreenUp) {
				ScrollOBox(1);
			} else {
				ScrollUBox(1);
			}
		}
		
		if (Input.GetButtonDown("Jump") || Input.GetKeyDown (KeyCode.Return)) {
			if (optionScreenUp) {
				if (oBackSelected) {
					PlaySelect (2);
					CloseOptionScreen();
				} else {
					if (Purchase(centerUBox, oBoxScrollPosition)) {
						ResetScrollOBox();
					}
				}
			} else {
				PlaySelect (3);
				OpenOptionScreen();				
			}
		}
		
		if (Input.GetButtonDown("Vertical")) {
			PlayScroll ();
			var max : int = oBoxCount;
			if (demo) { max = oBoxCount - 3; }
			if (optionScreenUp && oBoxPurchased[centerUBox] < max)
				oBackSelected = !oBackSelected;
		}
	}
}

function PlayScroll () {
	AudioManager.PlayElement ("Scroll", new PlaySettings (AudioManager.GetMetronome("Main"), 0.25));
}

function PlaySelect (pitch : int) {
	selectPitch.SetPitch (pitch);
	AudioManager.PlayElement ("Select", new PlaySettings (AudioManager.GetMetronome("Main"), 0.25));
}

function PlayUnselectable () {
	AudioManager.PlayElement ("Unselectable", new PlaySettings (AudioManager.GetMetronome("Main"), 0.25));
}

function OpenOptionScreen () {
	if (!repositioning) {
		//oBoxScrollPosition = 0;
		//oBackSelected = false;
		ResetScrollOBox();
		repositioning = true;
		optionScreenUp = true;
		animation.Play("OBackgroundGrow");
		yield StartCoroutine(SlideSelectedUBox(0.5, Vector2(center, middle), optionUBoxPosition));
		var wait : float = animation["DScaleGrow"].length;
		animation.Play("DScaleGrow");
		yield WaitForSeconds(wait + 0.05);
		animation.Play("OPulse");
		repositioning = false;
	}
}

function CloseOptionScreen () {
	if (!repositioning) {
		repositioning = true;
		
		if (mScale > 0.0) {
			animation.Play("MScaleShrink");
			yield WaitForSeconds(animation["MScaleShrink"].length);
		}
		
		var wait : float = animation["DScaleShrink"].length;
		animation.Play("DScaleShrink");
		yield WaitForSeconds(wait + 0.05);
		animation.Play("OBackgroundShrink");
		yield StartCoroutine(SlideSelectedUBox(0.5, optionUBoxPosition, Vector2(uBoxPos[1].x, middle)));
		optionScreenUp = false;
		animation["OPulse"].time = 7.5;
		animation.Stop("OPulse");
		repositioning = false;
	}
}

function ScrollUBox (direction : int) {
	if (!repositioning) {
		repositioning = true;
		uBoxScrollPosition += direction;
		if (uBoxScrollPosition > uBoxCount - 1) { 
			uBoxScrollPosition = 0;
		}
		
		if (uBoxScrollPosition < 0) {
			uBoxScrollPosition = uBoxCount - 1;
		}
	
		for (var i = 0; i < uBoxCount; i ++) {
			StartCoroutine(MoveUBox(0.5, i, direction));
		}
	}
}

function ScrollOBox (direction : int) {
	
	var max : int = 1;
	if (demo) max = 4;
	
	var minPos : int = oBoxPurchased[centerUBox];
	
	if (oBackSelected && minPos < oBoxCount - max) {
		oBackSelected = false;
	} else {
		oBoxScrollPosition += direction;
		
		if (oBoxScrollPosition < minPos) {
			oBoxScrollPosition = oBoxCount - max;
		}
		if (oBoxScrollPosition > oBoxCount - max) {
			oBoxScrollPosition = minPos;
		}
	}
}

function ResetScrollOBox () {
	
	var max : int = oBoxCount;
	if (demo) { max = oBoxCount - 3; }
	var pos : int = oBoxPurchased[centerUBox];
	if (pos < max) {
		oBoxScrollPosition = pos;
		oBackSelected = false;
	} else {
		oBackSelected = true;
	}	 
}

// --------------------------------------------- Drawing --------------------------------------------- //

function OnGUI () {
	if (screenUp) {
		DrawBackground();
		DrawBoxes();
		DrawMBar();
		DrawDescription();
		if (optionScreenUp) {
			DrawOptionBoxes();
			DrawOBack();
			if (demo) DrawDemo ();
		}
	}
}

function DrawBackground () {
	GUI.DrawTexture(backgroundBox, texBlack, ScaleMode.StretchToFill, true, 0);
}

function DrawOBackground () {
	var rect : Rect = CenteredRect(center, middle, screenWidth, oBackground.height * oBackgroundScale);
	GUI.DrawTexture(rect, texBlack, ScaleMode.StretchToFill, true, 0);
}

function DrawBoxes () {

	// Draw the boxes in order
	
	// Boxes shrinking to nothing
	for (var i = 0; i < uBoxCount; i ++) {
		if (uBox[i].height < uBoxSize.y / 2.0 && uBox[i].height > 0.0) {
			DrawUBox(i);
		}
	}
	
	//Boxes expanding to the sides
	for (i = 0; i < uBoxCount; i ++) {
		if (uBox[i].height >= uBoxSize.y / 2.0 && uBox[i].height < uBoxSize.y) {
			DrawUBox(i);
		} 
	}
	
	DrawOBackground();
	
	// Boxes moving to the center and forefront
	for (i = 0; i < uBoxCount; i ++) {
		if (uBox[i].height > uBoxSize.y / 2.0) {
			DrawUBox(i);
		}
	}
}

function DrawUBox (pos : int) {
	uBoxStyle.fontSize = uBoxFontSize * (uBox[pos].height / uBoxSize.y) * uScale;
	
	var box : Rect = uBox[pos];
	if (uScale < 1.0 && Mathf.Abs(pos - 6) != uBoxScrollPosition) {
		box = CenteredRect(uBoxPos[pos].x, uBoxPos[pos].y, uBox[pos].width * uScale, uBox[pos].height * uScale);
	}
	
	GUI.DrawTexture(box, texYellow, ScaleMode.StretchToFill, true, 0);
	
	if (uScale == 1.0) {
		DrawUBoxText(pos);
		DrawUBoxSubText(pos);
	}
	
}

function DrawUBoxText (pos : int) {
	var textPos : Rect = uBox[pos];
	textPos.y += (uBox[pos].height / 3);
	
	var shadowPos : Rect = textPos;
	shadowPos.x += 1;
	shadowPos.y += 1;
	
	DrawTextBackground(uBox[pos].x + (uBox[pos].width / 2) + 1, textPos.y + 1, pos, CustomColor.black);
	DrawTextBackground(uBox[pos].x + (uBox[pos].width / 2), textPos.y, pos, CustomColor.red);
	
	uBoxStyle.alignment = TextAnchor.UpperCenter;
	
	uBoxStyle.normal.textColor = CustomColor.black;
	GUI.Label(shadowPos, uBoxTitle[pos], uBoxStyle);
	
	uBoxStyle.normal.textColor = CustomColor.white;
	GUI.Label(textPos, uBoxTitle[pos], uBoxStyle);
}

function DrawUBoxSubText (pos : int) {
	
	var textPos : Rect = uBox[pos];
	textPos.y += ((uBox[pos].height / 3.0) * 1.75);
	
	var shadowPos : Rect = textPos;
	shadowPos.x += 1;
	shadowPos.y += 1;
	
	var text : String = "Next upgrade at \n" + nextUpgradePrice[pos] + " coins";
	if (nextUpgradePrice[pos] == -1) {
		text = "Maxed out!";
	}
	uBoxStyle.fontSize /= 2;
	
	//uBoxStyle.normal.textColor = CustomColor.white;
	//GUI.Label(shadowPos, text, uBoxStyle);
	
	uBoxStyle.normal.textColor = CustomColor.black;
	GUI.Label(textPos, text, uBoxStyle);
	
}

function DrawTextBackground (x : int, y : int, option : int, color : Color) {
	
	var bor : int = 16.0;
	var w : int = uTextDimensions[option].x * (uBox[option].width / uBoxSize.x);
	var h : int = uTextDimensions[option].y * (uBox[option].height / uBoxSize.y);
	
	h += bor;
	
	var side : int = (uTextDimensions[option].y / 1.5) * (uBox[option].width / uBoxSize.x);
	var left : int = x - (w / 2) - side;
	var right : int = x + (w / 2);
	var top : int = y - (bor / 2);// - (h / 2);
	
	GUI.color = color;	
	GUI.DrawTexture(Rect(left, top, side, h), texTextEdgeL, ScaleMode.StretchToFill);
	GUI.DrawTexture(Rect(left + side, top, w, h), texTextBack, ScaleMode.StretchToFill);
	GUI.DrawTexture(Rect(right, top, side, h), texTextEdgeR, ScaleMode.StretchToFill);
	GUI.color = Color.white;
	
}

function DrawOptionBoxes () {
	
	GUI.color = Color.white;
	for (var i = 0; i < oBoxCount; i ++) {
		DrawOBox(i);
	}
}

function DrawOBox (pos : int) {
	
	var selected : boolean = (pos == oBoxScrollPosition && !oBackSelected);
	var unselectable : boolean = (oBoxPurchased[centerUBox] > pos);
	if (demo) unselectable = (oBoxPurchased[centerUBox] > pos) || pos > 1;
	var pulse : float = 1.0;
	if (selected) {
		pulse = oPulse;
	}
	var rect : Rect = CenteredRect(oBoxPos[pos].x, oBoxPos[pos].y, oBox[pos].width * pulse, oBox[pos].height * oScale * pulse);
	
	var tex : Texture2D = texWhite;
	if (selected) {
		tex = texYellow;
	}
	if (unselectable) {
		tex = texGrey;
	}
	uBoxStyle.fontSize = (uBoxFontSize * (rect.height / oBoxSize.y)) / 1.5;
	uBoxStyle.normal.textColor = CustomColor.white;
	uBoxStyle.alignment = TextAnchor.UpperCenter;
	GUI.DrawTexture(rect, tex, ScaleMode.StretchToFill, true, 0);
	
	if (oScale > 0.25) {
		var textPos : Rect = rect;
		textPos.y += oBoxSize.y / 4.0;
		
		textPos.x += 1;
		textPos.y += 1;
		GUI.color = CustomColor.yellow;
		if (selected) {
			GUI.color = CustomColor.white;
		}
		if (unselectable) {
			GUI.color = CustomColor.black;
		}
		GUI.Label(textPos, oBoxTitle[centerUBox][pos] + "\n" + oBoxPrice[centerUBox][pos] + "c", uBoxStyle);
		
		textPos.x -= 1;
		textPos.y -= 1;
		GUI.color = CustomColor.black;
		if (unselectable) {
			GUI.color = CustomColor.grey;
		}
		GUI.Label(textPos, oBoxTitle[centerUBox][pos] + "\n" + oBoxPrice[centerUBox][pos] + "c", uBoxStyle);
		
		GUI.color = CustomColor.white;
	}
}

function DrawOBack () {
	var pulse : float = 1.0;
	if (oBackSelected) {
		pulse = oPulse;
	}
	var rect : Rect = CenteredRect(oBackPos.x, oBackPos.y, oBackSize.x * pulse, oBackSize.y * oScale * pulse);
	var tex : Texture2D = texRed;
	if (oBackSelected) {
		tex = texYellow;
	}
	GUI.DrawTexture(rect, tex, ScaleMode.StretchToFill, true, 0);
	
	uBoxStyle.fontSize = (uBoxFontSize * (rect.height / oBackSize.y)) / 1.5;
	uBoxStyle.alignment = TextAnchor.MiddleCenter;
	
	if (oScale > 0.25) {
		var textPos : Rect = rect;
		//textPos.y += oBackSize.y / 5.0;
		
		textPos.x += 1;
		textPos.y += 1;
		GUI.color = CustomColor.black;
		GUI.Label(textPos, "Back", uBoxStyle);
		
		textPos.x -= 1;
		textPos.y -= 1;
		GUI.color = CustomColor.white;
		GUI.Label(textPos, "Back", uBoxStyle);
	}
	
}

function DrawMBar () {
	var rect : Rect = CenteredRect(mBarPos.x, mBarPos.y, mBarSize.x * mScale, mBarSize.y);
	GUI.DrawTexture(rect, texRed, ScaleMode.StretchToFill, true, 0);
	
	if (mScale > 0.25) {
		mBarStyle.fontSize = (40.0 * (rect.width / mBarSize.x)) / 1.5;
		
		var textPos : Rect = rect;
		
		textPos.x += 1;
		textPos.y += 1;
		GUI.color = CustomColor.black;
		GUI.Label(textPos, mBarMessage, mBarStyle);
		
		textPos.x -= 1;
		textPos.y -= 1;
		GUI.color = CustomColor.white;
		GUI.Label(textPos, mBarMessage, mBarStyle);
	}
}

function DrawDescription () {
	if (optionScreenUp) {
		descriptionText = uDescription[centerUBox];
	} else {
		descriptionText = descriptionMain;
	}
	LabelWithShadow(Rect(center, top + border, 0, 0), descriptionText, descriptionStyle, CustomColor.grey, CustomColor.black);
}

function DrawDemo () {
	
	var pos : int = 3;
	var rect : Rect = CenteredRect(oBoxPos[pos].x, oBoxPos[pos].y, oBox[pos].width, oBox[pos].height * oScale);
	
	uBoxStyle.fontSize = uBoxFontSize * 2.5 * oScale;
	uBoxStyle.normal.textColor = CustomColor.white;
	uBoxStyle.alignment = TextAnchor.MiddleCenter;
	if (oScale > 0.0)
		LabelWithShadow (rect, "DEMO", uBoxStyle, CustomColor.white, Color.black);
}

// --------------------------------------------- Feedback --------------------------------------------- //

function ShowMessage (message : String) {
	mBarMessage = message;
	animation.Stop("MScaleShrink");
	animation.Play("MScaleGrow");
	animation.Play("OPulse");
	yield WaitForSeconds(2.0);
	if (mScale == 1.0)
		CloseMessage();
}

function CloseMessage () {
	animation.Stop("MScaleGrow");
	animation.Play("MScaleShrink");
	animation.Play("OPulse");
}

// --------------------------------------------- Animation --------------------------------------------- //

function MoveUBox (time : float, box : int, direction : int) {
	
	var elapsedTime : float = 0.0;

	// Find our new position in the array
	var arrayPos : int = box + uBoxScrollPosition;
	if (arrayPos < 0) {
		arrayPos = uBoxCount + uBoxScrollPosition;
	}	
	if (arrayPos > uBoxCount - 1) {
		arrayPos -= uBoxCount;
	}
	
	// Set this to the center box if the position in the array is 1
	if (arrayPos == 1) {
		centerUBox = box;
	}
	
	// Find our previous position in the array
	var prevArrayPos : int = arrayPos - direction;
	if (prevArrayPos < 0) {
		prevArrayPos = uBoxCount - 1;
	}
	if (prevArrayPos > uBoxCount - 1) {
		prevArrayPos = 0;
	}
	
	// Start
	var startPosition : Vector2 = GetRectCenter(uBox[box]);
	var startSize : Vector2 = Vector2(uBoxSize.x * uBoxScale[prevArrayPos], uBoxSize.y * uBoxScale[prevArrayPos]);
		
	// End
	var endPosition : Vector2 = uBoxPos[arrayPos];
	var endSize : Vector2 = GetUBoxSize(arrayPos);
	
	var pos : Vector2 = startPosition;
	var size : Vector2 = startSize;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent = elapsedTime / time;
		
		pos = Vector2.Lerp(startPosition, endPosition, percent);
		size = Vector2.Lerp(startSize, endSize, percent);
		uBox[box] = CenteredRect(pos.x, pos.y, size.x, size.y);
		
		yield;
	}

	repositioning = false;
}

function SlideSelectedUBox (time : float, startPosition : Vector2, endPosition : Vector2) {
	
	var elapsedTime : float = 0.0;
	var pos : Vector2;
	var size : Vector2 = uBoxSize;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent = elapsedTime / time;
		pos = Vector2.Lerp(startPosition, endPosition, percent);
		uBox[centerUBox] = CenteredRect(pos.x, pos.y, size.x, size.y);
		yield;
	}
	
}

// --------------------------------------------- Array functions --------------------------------------------- //

function GetUBoxSize (pos : int) : Vector2 {
	return Vector2(uBoxSize.x * uBoxScale[pos], uBoxSize.y * uBoxScale[pos]);
}

// --------------------------------------------- Purchase --------------------------------------------- //

function Purchase (u : int, d : int) {

	if (Score.coinCount >= oBoxPrice[u][d] && Inventory.instance.GetItem(u) < (d + 1)) {
		SubtractScore(oBoxPrice[u][d]);
		Inventory.instance.SetItem(u, (d + 1));
		ShowMessage("Upgraded " + uBoxTitle[u].ToLower() + " for " + oBoxPrice[u][d] + " coins!");
		PlaySelect (4);
		return true;
	} else {
		if (Score.coinCount < oBoxPrice[u][d])
			ShowMessage("Not enough coins!");
		//PlaySelect (1);
		PlayUnselectable ();
		return false;
	}
}

function SubtractScore (i : int) {
	Score.instance.AddScore(-i);
}

// --------------------------------------------- Messages --------------------------------------------- //

function _UpdateInventory () {
	for (var i = 0; i < oBoxPurchased.Length; i ++) {
		var item : int = Inventory.instance.GetItem(i);
		if (item < 6) {
			oBoxPurchased[i] = item;
			
			// this is voodoo	
			if (item < 5) {
				nextUpgradePrice[i] = oBoxPrice[i][item];
			} else {
				nextUpgradePrice[i] = -1;
			}
		} else {
			nextUpgradePrice[i] = -1;
		}
	}
}

function _RestartGame () {
	ResetNextUpgradePrice();
	CloseOptionScreen();
}
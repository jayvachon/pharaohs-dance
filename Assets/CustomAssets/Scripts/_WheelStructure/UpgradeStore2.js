#pragma strict

var descriptionStyle : GUIStyle;
var uBoxStyle : GUIStyle;
private var uBoxFontSize : int;

// Player components
private var input : FPSInputController;
private var motor : CharacterMotor;
private var controller : CharacterController;
private var player : Transform;

private var screenUp : boolean = false;

// Upgrade boxes
private var uBoxSize : Vector2;

private var uBoxTitle : String[] = [ "Parachute", 
									 "Heaviness", 
									 "Magnet", 
									 "Jump Size", 
									 "Jetpack", 
									 "Stomach Size", 
									 "Pill Duration" ];			// titles
									 
private var uBoxScale : float[];			// sizes that boxes scroll through
private var uBoxPos : Vector2[];			// position of boxes
private var uBox : Rect[];					// position & size of boxes displayed
private var uBoxCount : int;				// number of upgrades (effectively the array length of the above)
private var uBoxScrollPosition : int = 0; 	// Our position within the menu 
private var centerUBox : int = 1;			// The upgrade box currently in the center

// Descriptions
private var descriptionText = "Buy upgrades and become less of a weakling. Space selects. Escape leaves.";
private var uDescription : String[] = [ "Stop dropping like a brick! Fall with grace and style.",
										"Press buttons faster with greater girth.",
										"Grab coins and bonuses with greater ease.",
										"Jump higher and with sexier legs.",
										"It's a jetpack.",
										"Hold more crystals with a larger stomach.",
										"Make pill bonuses more effective." ];
										
// Detail screen
private var detailScreenUp : boolean = false;
private var detailUBoxPosition : Vector2;
private var dBoxTitle = [ 
							[ "Tiny", "Small", "Medium", "Large", "Giant" ],
							[ "2lb", "5lb", "10lb", "25lb", "45lb" ],
							[ "Tiny", "Small", "Medium", "Large", "Giant" ],
							[ "1ft", "2ft", "3ft", "4ft", "5ft" ],
							[ "Tiny", "Small", "Medium", "Large", "Giant" ],
							[ "10", "15", "25", "45", "100" ],
							[ "20sec", "25sec", "30sec", "45sec", "60sec" ]	
						];
						
private var dBoxPrice =	[ 
							[ 75, 200, 350, 500, 750 ],	
							[ 150, 300, 500, 1000, 2000 ],
							[ 500, 750, 1500, 2500, 3500 ],
							[ 200, 500, 750, 1000, 1500 ],
							[ 350, 500, 1000, 1500, 3000 ],
							[ 50, 150, 350, 750, 1500 ],
							[ 100, 250, 350, 750, 2000 ]
						];

private var dBoxSize : Vector2;
private var dBoxPos : Vector2[];
private var dBox : Rect[];
private var dBoxCount : int;
private var dBoxScrollPosition : int = 0;

private var dBackSize : Vector2;
private var dBackPos : Vector2;
private var dBackRect : Rect;
private var dBackSelected : boolean = false;

private var showMessage : String = "";

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

// Navigation
private var repositioning : boolean = false;

function Start () {
	
	GetPlayerComponents();
	ColorPlatform();
	GetWindowDimensions();
	SetScreenDimensions(0.825);
	
	backgroundBox = CenteredRect(center, middle, screenWidth, screenHeight);
	
	// Upgrade boxes
	SetUBoxSize(5.0, 2.5);
	SetUBoxCount();
	SetUBoxScales();
	SetUBoxPositions();
	SetUBoxRects();
	
	// Detail boxes
	detailUBoxPosition = Vector2(right + border + (uBoxSize.x / 2), middle);
	
	dBoxCount = 5;
	SetDBoxSize(dBoxCount, dBoxCount);
	SetDBoxPositions();
	SetDBoxRects();
	
	dBackSize = Vector2(dBoxSize.x / 3, dBoxSize.y / 6);
	dBackPos = Vector2(dBoxPos[0].x, dBoxPos[0].y + dBoxSize.y);
	dBackRect = CenteredRect(dBackPos.x, dBackPos.y, dBackSize.x, dBackSize.y);
	
	uBoxFontSize = uBoxStyle.fontSize;
	
	CreateTextures();
}

function GetHalfBoxSize (scale : int) {
	return Vector2((uBoxSize.x / 2) * scale, (uBoxSize.y / 2) * scale);
}

function GetPlayerComponents () {
	player = GameObject.Find("Player").transform;
	input = player.GetComponent(FPSInputController);
	motor = player.GetComponent(CharacterMotor);
	controller = player.GetComponent(CharacterController);
}

function ColorPlatform () {
	renderer.materials[0].color = CustomColor.black;
	renderer.materials[1].color = CustomColor.yellow;
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
	border = ((screenHeight / 10) + (screenWidth / 10)) / 2;
}

function CreateTextures () {
	texBlack = CreateTextureFromColor(CustomColor.black);
	texYellow = CreateTextureFromColor(CustomColor.yellow);
	texWhite = CreateTextureFromColor(CustomColor.white);
	texRed = CreateTextureFromColor(CustomColor.red);
}

// Upgrade boxes
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

// Detail boxes
function SetDBoxSize (w : float, h : float) {
	dBoxSize = Vector2((screenWidth + 0.0) / w, (screenHeight + 0.0) / h);
}

function SetDBoxPositions () {
	dBoxPos = new Vector2[dBoxCount];	
	var startX : int = detailUBoxPosition.x + (uBoxSize.x);
	var sep : int = dBoxSize.x / 8;
	
	for (var i = 0; i < dBoxCount; i ++) {
		var x = startX + (i * sep) + (i * (dBoxSize.x / 2));
		dBoxPos[i] = Vector2(x, middle);
	}
}

function SetDBoxRects () {
	dBox = new Rect[dBoxCount];
	for (var i = 0; i < dBoxCount; i ++) {
		dBox[i] = CenteredRect(dBoxPos[i].x, dBoxPos[i].y, dBoxSize.x, dBoxSize.y);
	}
}

// --------------------------------------------- Opening & Closing --------------------------------------------- //
function OnTriggerEnter (other : Collider) {
	if (other.tag == "Net") {
		OpenScreen();
	}
}

function OpenScreen () {
	input.stop = true;
	yield WaitForStop();
	input.enabled = false;
	screenUp = true;
	motor.enabled = false;
	new MessageOpenScreen();
}

function CloseScreen () {
	motor.enabled = true;
	input.enabled = true;
	input.stop = false;
	screenUp = false;
	new MessageCloseScreen();
}

function WaitForStop () {
	while (controller.velocity != Vector3.zero) {
		yield;
	}
}

function Update () {
	if (screenUp) {
		if (Input.GetButtonDown("Action1")) {
			Score.instance.AddScore(100);
		}
		if (Input.GetKeyDown(KeyCode.Escape)) {
			CloseScreen();
		}
		if (Input.GetButtonDown("MenuClose")) {
			CloseScreen();
		}
		
		if (Input.GetButtonDown("MenuLeft")) {
			if (detailScreenUp)
				ScrollDBox(-1); 
			else
				ScrollUBox(-1);
		}
		
		if (Input.GetButtonDown("MenuRight")) {
			if (detailScreenUp)
				ScrollDBox(1);
			else
				ScrollUBox(1);
		}
		
		if (Input.GetButtonDown("Jump")) {
			if (detailScreenUp) {
				if (dBackSelected)
					CloseDetailScreen();
				else
					SelectDBox();
			} else {
				OpenDetailScreen();
			}
		}
		
		if (Input.GetButtonDown("Vertical")) {
			if (detailScreenUp)
				dBackSelected = !dBackSelected;
		}
	}
}

// --------------------------------------------- GUI functions --------------------------------------------- //
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

function GetRectCenter (r : Rect) : Vector2 {
	return Vector2(r.x + (r.width / 2), r.y + (r.height / 2));
}

// --------------------------------------------- Drawing --------------------------------------------- //
function OnGUI () {
	if (screenUp) {
		DrawBackground();
		DrawDescription();
		
		if (detailScreenUp) {
			DrawDetailScreen();
		} else {
			DrawBoxes();
			DrawUDescription();
		}
	}
}

function DrawBackground () {
	GUI.DrawTexture(backgroundBox, texBlack, ScaleMode.StretchToFill, true, 0);
}

function DrawDescription () {
	LabelWithShadow(Rect(center, top + border, 0, 0), descriptionText, descriptionStyle, CustomColor.yellow);
}

function DrawUDescription () {
	LabelWithShadow(Rect(center, bottom - border - descriptionStyle.fontSize, 0, 0), uDescription[centerUBox], descriptionStyle, CustomColor.grey);
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
	
	// Boxes moving to the center and forefront
	for (i = 0; i < uBoxCount; i ++) {
		if (uBox[i].height > uBoxSize.y / 2.0) {
			DrawUBox(i);
		}
	}
}

function DrawUBox (pos : int) {
	uBoxStyle.fontSize = uBoxFontSize * (uBox[pos].height / uBoxSize.y);
	GUI.DrawTexture(uBox[pos], texYellow, ScaleMode.StretchToFill, true, 0);
	var textPos : Rect = uBox[pos];
	textPos.y += 8;
	GUI.Label(textPos, uBoxTitle[pos], uBoxStyle);
}

function DrawDetailScreen () {
	DrawDetailBoxes();
	DrawUBox(centerUBox);
	DrawBackButton();
	if (showMessage != "") {
		ShowMessage(showMessage);
	}
}

function DrawDetailBoxes () {
	for (var i = 0; i < dBoxCount; i ++) {
		DrawDBox(i);
	}
}

function DrawDBox (pos : int) {
	
	var rect : Rect = dBox[pos];
	
	// The selected box is drawn a little bit bigger
	if (pos == dBoxScrollPosition && !dBackSelected) {
		rect = CenteredRect(dBoxPos[pos].x, dBoxPos[pos].y, dBoxSize.x * 1.15, dBoxSize.y * 1.15);
	}
	
	uBoxStyle.fontSize = (uBoxFontSize * (rect.height / dBoxSize.y)) / 2;
	GUI.DrawTexture(rect, texWhite, ScaleMode.StretchToFill, true, 0);
	
	var textPos : Rect = rect;
	textPos.y += dBoxSize.y / 4;
	GUI.Label(textPos, dBoxTitle[centerUBox][pos] + "\n" + dBoxPrice[centerUBox][pos] + " coins", uBoxStyle);
}

function DrawBackButton () {
	var rect = dBackRect;
	if (dBackSelected) {
		rect = CenteredRect(dBackPos.x, dBackPos.y, dBackSize.x * 1.15, dBackSize.y * 1.15);
	}
	
	uBoxStyle.fontSize = (uBoxFontSize * (rect.height / dBackSize.y)) / 2;
	GUI.DrawTexture(rect, texRed, ScaleMode.StretchToFill, true, 0);
	
	GUI.Label(rect, "Back", uBoxStyle);
}

function LabelWithShadow (pos : Rect, text : String, style : GUIStyle, col : Color) {
	
	var p : Rect = pos;
	p.x += 2;
	p.y += 2;
	GUI.color = Color.black;
	GUI.Label(p, text, style);
	
	GUI.color = col;
	GUI.Label(pos, text, style);

}

// --------------------------------------------- Navigation --------------------------------------------- //
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
			StartCoroutine(MoveUBox(0.75, i, direction));
		}
	}
}

function OpenDetailScreen () {
	detailScreenUp = true;
	StartCoroutine(SlideSelectedUBox(0.75, Vector2(center, middle), detailUBoxPosition));
}

function CloseDetailScreen () {
	StartCoroutine(SlideSelectedUBox(0.75, detailUBoxPosition, Vector2(uBoxPos[1].x, middle)));
	detailScreenUp = false;
}

function ScrollDBox (direction : int) {
	
	if (dBackSelected) {
		dBackSelected = false;
	} else {
		dBoxScrollPosition += direction;
		
		if (dBoxScrollPosition < 0) {
			dBoxScrollPosition = dBoxCount - 1;
		}
		if (dBoxScrollPosition > dBoxCount - 1) {
			dBoxScrollPosition = 0;
		}
	}
}

function SelectDBox () {
	Purchase(centerUBox, dBoxScrollPosition);
}

function Purchase (u : int, d : int) {

	if (Score.coinCount >= dBoxPrice[u][d] && Inventory.instance.GetItem(u) < (d + 1)) {
		SubtractScore(-dBoxPrice[u][d]);
		Inventory.instance.SetItem(u, (d + 1));
		showMessage = "Bought " + uBoxTitle[u] + " for " + dBoxPrice[u][d] + " coins!";
	} else {
		if (Score.coinCount < dBoxPrice[u][d])
			showMessage = "Not enough coins!";
		else
			showMessage = "You already have a better " + uBoxTitle[u] + "!";
	}
}

function SubtractScore (i : int) {
	Score.instance.AddScore(i);
}

function ShowMessage (text : String) {
	GUI.Box(CenteredRect(center, middle, 400, 400), text);
	if (GUI.Button(CenteredRect(center, middle + 150, 100, 50), "OK")) {
		showMessage = "";
	}
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

function ShrinkNonSelectedBoxes () {
	for (var i = 0; i < uBoxCount; i ++) {
		if (i != centerUBox) {
			
		}
	}
}

// --------------------------------------------- Array functions --------------------------------------------- //
function GetPositionInArray (b : int) : int {
	for (var i = 0; i < uBoxCount; i ++) {
		if (GetRectCenter(uBox[b]).x == uBoxPos[i].x && GetRectCenter(uBox[b]).y == uBoxPos[i].y) {
			return i;
		}
	}
	return 0;
}

function GetUBoxSize (pos : int) : Vector2 {
	return Vector2(uBoxSize.x * uBoxScale[pos], uBoxSize.y * uBoxScale[pos]);
}

// --------------------------------------------- Messages --------------------------------------------- //
function _RestartGame () {
	yield WaitForFixedUpdate();
	CloseScreen();
}
#pragma strict

var upgradeTexture : Texture2D[] = new Texture2D[5];

private var main : GUIStyle;
var optionBox : GUIStyle = new GUIStyle();
var subOptionBox : GUIStyle = new GUIStyle();
private var subOptionBoxSelect : GUIStyle = new GUIStyle();
var infoBoxTitle : GUIStyle = new GUIStyle();
//var infoBox : GUIStyle = new GUIStyle();
private var solidSubOptions : boolean = false;					// If we are not in a submenu, do not draw the solid colored boxes

private var boxWidth : float;
private var boxHeight : float;

private var boxTitle : String[] = [ "Parachute", "Heaviness", "Magnet", "Jump Size", "Jetpack" ];	// titles
private var boxSize : float[] = [ 0.5, 1.0, 0.5, 0.0, 0.0 ];										// sizes that boxes scroll through
private var boxPos : Vector2[];																		// position of boxes
private var box : Rect[];																			// position & size of boxes displayed

private var description : String[] =  [ "Gracefully glide to stable ground with these state-of-the-art parachutes.", 
										"Get nice and plump and push those buttons down quicker!",
										"Attract coins and other bonuses with greater ease.",
										"Beef up that leg strength and take to the air with far greater vigor.",
										"It's a goddamned jetpack. I think you know what that means." ];
										
private var subOptions =  [ [ "Small", "Medium", "Large", "Back" ], 
							[ "25lb", "50lb", "100lb", "Back" ],
							[ "Small", "Medium", "Large", "Back" ],
							[ "2ft", "4ft", "8ft", "Back" ],
							[ "Lite", "Mid", "Strong", "Back" ] ];

private var subOptionPrices = [ [ 250, 500, 666, 0 ], 
								[ 1000, 2500, 3500, 0 ],
								[ 500, 1500, 2500, 0 ],
								[ 1500, 3500, 5000, 0 ],
								[ 2500, 5000, 6666, 0 ] ];
private var subBoxes : int = 4;
private var subSelection : int = 0;

private var repositioning : boolean = false;

private var fontSize : int = 48;

private var infoWidthFull : float;
private var infoWidth : float = 0.0;
private var infoHeight : float;
private var infoPos : Vector2;

private var subBoxWidth : float;
private var subBoxHeight : float;
private var subBoxDiv : float;
private var subBoxPos : Vector2;

// Window values
private var width : int;
private var height : int;
private var center : int;
private var middle : int;
private var xEdge : int;

private var screenUp : boolean = false;
private var detailScreen : boolean = false;
private var detailBox : int = 0;

private var input : FPSInputController;
private var controller : CharacterController;

// Textures
private var texWhite : Texture2D;
private var texYellow : Texture2D;
private var texBlack : Texture2D;
private var texGrey : Texture2D;
private var texYellowFade : Texture2D[];

function Awake () {
	
	width = Screen.width;
	height = Screen.height;
	center = width / 2;
	middle = height / 2;
	xEdge = width / 4;
		
	boxWidth = width / 3;
	boxHeight = height / 1.5;
	
	infoWidthFull = width / 2;
	infoHeight = height / 1.75;
	infoPos = Vector2(xEdge + (boxWidth / 2), middle - (infoHeight / 2));
	
	subBoxWidth = infoWidthFull / (subBoxes + 1);
	subBoxDiv = subBoxWidth / 8;
	subBoxHeight = infoHeight / 3;
	
	subBoxPos = Vector2(infoPos.x + (subBoxWidth / 2) - ((subBoxDiv * (subBoxes - 1) / 2)), middle);
	
	box = new Rect[boxTitle.Length];
	boxPos = new Vector2[boxTitle.Length];
	
	boxPos[0] = Vector2(center - (boxWidth + (boxWidth / 4)), middle - (boxHeight / 4));
	boxPos[1] = Vector2(center - (boxWidth / 2), middle - (boxHeight / 2));
	boxPos[2] = Vector2(center + (boxWidth - (boxWidth / 4)), middle - (boxHeight / 4));
	boxPos[3] = Vector2(center, middle + 1);
	boxPos[4] = Vector2(center, middle - 1);
	
	for (var i = 0; i < box.Length; i ++) {
		box[i] = Rect(boxPos[i].x, boxPos[i].y, boxWidth * boxSize[i], boxHeight * boxSize[i]);
	}

}

function Start () {
	
	renderer.materials[0].color = CustomColor.black;
	renderer.materials[1].color = CustomColor.yellow;
	
	// Initialize the GUIStyles
	main = new GUIStyle();
	
	main.normal.background = CreateNewTexture(Color(CustomColor.black.r, CustomColor.black.g, CustomColor.black.b, 0.75));
	optionBox.normal.background = CreateNewTexture(CustomColor.yellow);
	optionBox.normal.textColor = CustomColor.black;
	infoBoxTitle.normal.background = CreateNewTexture(CustomColor.black);
	infoBoxTitle.normal.textColor.a = 0.0;
	
	var c : Color = CustomColor.yellow;
	subOptionBox.normal.background = CreateNewTexture(Color(c.r, c.g, c.b, 0.0));
	subOptionBox.normal.textColor = CustomColor.black;
	subOptionBox.normal.textColor.a = 0.0;
	
	var c2 : Color = CustomColor.white;
	subOptionBoxSelect = subOptionBox;
	subOptionBoxSelect.normal.background = CreateNewTexture(Color(c2.r, c2.g, c2.b, 0.0));
	
	var player = GameObject.Find("Player").transform;
	input = player.GetComponent(FPSInputController);
	controller = player.GetComponent(CharacterController);
	
	texWhite = CreateNewTexture(CustomColor.white);
	texYellow = CreateNewTexture(CustomColor.yellow);
	texGrey = CreateNewTexture(CustomColor.grey);
	CreateFadeArray();
}

function CreateFadeArray () {
	texYellowFade = new Texture2D[100];
	var c3 : Color = CustomColor.yellow;
	for (var i = 0; i < texYellowFade.Length; i ++) {
		texYellowFade[i] = CreateNewTexture(Color(c3.r, c3.g, c3.b, i / (texYellowFade.Length + 0.0)));
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

// ------------------------------------------- // Player Input // ------------------------------------------- // 

function Update () {
	if (screenUp) {
		if (Input.GetButtonDown("Jump")) {
			if (detailScreen) {
				if (subSelection == subBoxes - 1) {
					ToggleDetailScreen();
				} else {
					Purchase(detailBox, subSelection);
				}
			} else {
				ToggleDetailScreen();
			}
		}
		if (detailScreen) {
			if (Input.GetButtonDown("MenuRight")) {
				MoveSubSelection(1);
			}
			if (Input.GetButtonDown("MenuLeft")) {
				MoveSubSelection(-1);
			}
		} else {
			if (Input.GetButton("MenuRight")) {
				MoveMenuPosition(1);
			}
			if (Input.GetButton("MenuLeft")) {
				MoveMenuPosition(-1);
			}
		}
		if (Input.GetButtonDown("Vertical")) {
			CloseScreen();
		}
		if (Input.GetButtonDown("CoinAdd")) {
			for (var i = 0; i < 10; i ++) {
				new MessageCollectBonus();
			}
			//Debug.Log(Score.coinCount);
		}
	}
}

function Purchase (s : int, subS : int) {
	
	var price : int = subOptionPrices[s][subS];
	if (Score.coinCount >= price) {
		Score.coinCount -= price;
		new MessageUpdateScore();
		
		if (Inventory.inventory[s] < subS + 1) {
			Inventory.inventory[s] = subS + 1;
		}
		
		new MessageUpdateInventory();
		
	} else {
		Debug.Log("POOR!!!");
	}

}

function FindUpgrade (s : int, subS : int) {
	
}

function MoveMenuPosition (direction : int) {
	if (!repositioning) {
		repositioning = true;
		for (var i = 0; i < box.Length; i ++) {
			StartCoroutine(ResizeBox(0.75, i, direction));
			StartCoroutine(MoveBox(0.75, i, direction));
		}
	}
}

function MoveSubSelection (direction : int) {
	if (subSelection + direction > subBoxes - 1) {
		subSelection = 0;
	} else if (subSelection + direction < 0) {
		subSelection = subBoxes - 1;
	} else {
		subSelection += direction;
	}
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Player") {
		OpenScreen();
	}
}

function OnTriggerExit (other : Collider) {
	if (other.tag == "Player") {
		CloseScreen();
	}
}

function OpenScreen () {
	input.stop = true;
	yield WaitForStop();
	input.enabled = false;
	screenUp = true;
	//yield FadeBackground(optionBox, 0.0, 1.0, 0.5);
}

function CloseScreen () {
	//yield FadeBackground(optionBox, 1.0, 0.0, 0.5);
	input.enabled = true;
	input.stop = false;
	screenUp = false;
}

function WaitForStop () {
	while (controller.velocity != Vector3.zero) {
		yield;
	}
}

function ToggleDetailScreen () {
	if (!repositioning) {
		if (!detailScreen) {
			OpenDetailScreen();			
		} else {
			CloseDetailScreen();
		}
	}
}

function OpenDetailScreen () {
	detailScreen = true;
	repositioning = true;
	
	detailBox = GetCenterBox();
	for (var i = 0; i < box.Length; i ++) {
		if (i != detailBox) {
			StartCoroutine(ShrinkNonDetailBox(0.5, i));
		}
	}
	StartCoroutine(ResizeInfo(0.75, infoWidthFull));
	yield StartCoroutine(MoveDetailBox(0.75, detailBox, xEdge));
	StartCoroutine(FadeText(infoBoxTitle, 0.0, 1.0, 0.5));
	StartCoroutine(FadeText(subOptionBox, 0.0, 1.0, 0.5));
	StartCoroutine(FadeBackground(subOptionBox, 0.0, 1.0, 0.5));
}

function CloseDetailScreen () {
	detailScreen = false;
	repositioning = true;
	StartCoroutine(FadeBackground(subOptionBox, 1.0, 0.0, 0.5));
	StartCoroutine(FadeText(subOptionBox, 1.0, 0.0, 0.5));
	yield StartCoroutine(FadeText(infoBoxTitle, 1.0, 0.0, 0.5));
	
	StartCoroutine(ResizeInfo(0.75, 0.0));
	StartCoroutine(MoveDetailBox(0.75, detailBox, center));
	for (var i = 0; i < box.Length; i ++) {
		if (i != detailBox && box[i].x != center) {
			StartCoroutine(GrowNonDetailBox(0.75, i));
		}
	}
}

// ddd
// --------------------------------------------- // Drawing // --------------------------------------------- // 

function OnGUI () {

	if (screenUp) {
		GUI.depth = 1;
		
		GUI.Label(Rect(0, 0, width, height), "", main);
		DrawInfo();		
		DrawBoxes();
	}
}

function DrawBoxes () {

	// Draws the boxes in order
	for (var i = 0; i < box.Length; i ++) {
		if (box[i].height < boxHeight / 2.0 && box[i].height > 0.0) {
			DrawBox(i);
		}
	}
	
	for (var j = 0; j < box.Length; j ++) {
		if (box[j].height >= boxHeight / 2.0 && box[j].height < boxHeight) {
			DrawBox(j);
		} 
	}
	
	for (var k = 0; k < box.Length; k ++) {
		if (box[k].height > boxHeight / 2.0) {
			DrawBox(k);
		}
	}
}

function DrawBox (pos : int) {
	optionBox.fontSize = fontSize * (box[pos].height / boxHeight);
	GUI.Label(box[pos], boxTitle[pos], optionBox);
	GUI.DrawTexture(box[pos], upgradeTexture[pos], ScaleMode.ScaleToFit, true, 0);
}

function DrawInfo () {
	GUI.Label(Rect(infoPos.x, infoPos.y, infoWidth, infoHeight), description[detailBox], infoBoxTitle);
	var style : GUIStyle = subOptionBox;
	
	for (var i = 0; i < 4; i ++) { 
		var div : float = 0.0;
		var border : int = 0;
		if (i > 0) 
			div = subBoxDiv;
		if (solidSubOptions) {
			if (i == subSelection) {
				border = subBoxDiv / 3;
				subOptionBox.normal.background = texWhite;
			}  else {
				if (Score.coinCount < subOptionPrices[detailBox][i]) {
					subOptionBox.normal.background = texGrey;	
				} else {
					subOptionBox.normal.background = texYellow;	
				}
			}
		}
		GUI.Label(Rect(subBoxPos.x + (subBoxWidth * i) + (div * i) - border, 
					   subBoxPos.y - border, subBoxWidth + (border * 2), 
					   subBoxHeight + (border * 2)), 
					   subOptions[detailBox][i] + "\n" + subOptionPrices[detailBox][i].ToString(), 
					   subOptionBox);
	}
}

// ccc
// --------------------------------------------- // Coroutines // --------------------------------------------- // 

function FadeText (style : GUIStyle, start : float, end : float, time : float) {
	var elapsedTime : float = 0.0;	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		style.normal.textColor.a = Mathf.Lerp(start, end, elapsedTime / time);
		yield;
	}
}

function FadeSubOptionBackground (start : float, end : float, time : float) {
	var elapsedTime : float = 0.0;	
	var c : Color = CustomColor.yellow;	
	var s : Color = Color(c.r, c.g, c.b, start);
	var e : Color = Color(c.r, c.g, c.b, end); 
	var t : Texture2D = CreateNewTexture(Color(c.r, c.g, c.b, 0.0));
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		subOptionBox.normal.background = CreateNewTexture(Color.Lerp(s, e, elapsedTime / time));
		yield;
	}
}

function FadeBackground (style : GUIStyle, start : float, end : float, time : float) {
	
	solidSubOptions = false; 
		
	var elapsedTime : float = 0.0;	
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var pos : int = Mathf.Min(Mathf.FloorToInt((elapsedTime / time) * 100), 99);
		if (end == 0.0)
			pos = Mathf.Abs(pos - 100);
		style.normal.background = texYellowFade[pos]; 
		yield;
	}
	
	if (end == 1)
		solidSubOptions = true;
	else
		solidSubOptions = false;
}

function ResizeBox (time : float, b : int, direction : int) {
	
	var elapsedTime = 0.0;
	var startWidth : float = box[b].width;
	var startHeight : float = box[b].height;
	
	var arrayPos : int = GetPositionInArray(b);
	var endWidth : float;
	var endHeight : float;
	var newSize : float;
	if (direction == 1) {
		newSize = (arrayPos < (boxSize.Length - 1) ? boxSize[arrayPos + 1] : boxSize[0]);
	} else {
		newSize = (arrayPos > 0 ? boxSize[arrayPos - 1] : boxSize[box.Length - 1]);
	}
	endWidth = boxWidth * newSize;
	endHeight = boxHeight * newSize;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent : float = (elapsedTime / time);
		box[b].width = Mathf.Lerp(startWidth, endWidth, percent);
		box[b].height = Mathf.Lerp(startHeight, endHeight, percent);
		yield;
	}
}

function MoveBox (time : float, b : int, direction : int) {
	
	var elapsedTime = 0.0;
	var startX : float = box[b].x;
	var startY : float = box[b].y;
	
	var arrayPos : int = GetPositionInArray(b);
	var newPos : Vector2;
	if (direction == 1)
		newPos = (arrayPos < (box.Length - 1) ? boxPos[arrayPos + 1] : boxPos[0]);
	else
		newPos = (arrayPos > 0 ? boxPos[arrayPos - 1] : boxPos[box.Length - 1]);
		
	var endX : float = newPos.x;
	var endY : float = newPos.y;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent : float = (elapsedTime / time);
		box[b].x = Mathf.Lerp(startX, endX, percent);
		box[b].y = Mathf.Lerp(startY, endY, percent);
		yield;
	}
	
	repositioning = false;
	
}

function MoveDetailBox (time : float, b : int, endX : float) {
	
	var elapsedTime = 0.0;
	
	var startX : float = box[b].x;	
	endX -= box[b].width / 2;	
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent : float = (elapsedTime / time);
		box[b].x = Mathf.Lerp(startX, endX, percent);
		yield;
	}
	
	repositioning = false;
	
}

function ShrinkNonDetailBox (time : float, b : int) {
	var elapsedTime : float = 0.0;
	var startWidth : float = box[b].width;
	var startHeight : float = box[b].height;
	var startX : float = box[b].x;
	var startY : float = box[b].y;
	var endX : float = box[b].x + (box[b].width / 2);
	var endY : float = box[b].y + (box[b].height / 2);
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent : float = (elapsedTime / time);
		box[b].width = Mathf.Lerp(startWidth, 0.0, percent);
		box[b].height = Mathf.Lerp(startHeight, 0.0, percent);
		box[b].x = Mathf.Lerp(startX, endX, percent);
		box[b].y = Mathf.Lerp(startY, endY, percent);
		yield;
	}
}

function GrowNonDetailBox (time : float, b : int) {
	
	// This coroutine only works for boxes on the sides
	var elapsedTime : float = 0.0;
	var endWidth : float = boxWidth * boxSize[0];
	var endHeight : float = boxHeight * boxSize[0];
	var startX : float = box[b].x;
	var startY : float = box[b].y;
	var endX : float = box[b].x - (endWidth / 2.0);
	var endY : float = box[b].y - (endHeight / 2.0);
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent : float = (elapsedTime / time);
		box[b].width = Mathf.Lerp(0.0, boxWidth * boxSize[0], percent);
		box[b].height = Mathf.Lerp(0.0, boxHeight * boxSize[0], percent);
		box[b].x = Mathf.Lerp(startX, endX, percent);
		box[b].y = Mathf.Lerp(startY, endY, percent);
		yield;
	}
}

function ResizeInfo (time : float, width : float) {
	
	var elapsedTime : float = 0.0;
	var startWidth : float = infoWidth;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		infoWidth = Mathf.Lerp(startWidth, width, elapsedTime / time);
		yield;
	}
	
}

// --------------------------------------------- // Array functions // --------------------------------------------- // 

function GetPositionInArray (b : int) : int {
	for (var i = 0; i < boxPos.Length; i ++) {
		if (box[b].x == boxPos[i].x && box[b].y == boxPos[i].y) {
			return i;
		}
	}
	return -1;
}

function GetCenterBox () : int {
	for (var i = 0; i < boxPos.Length; i ++) {
		if (box[i].x == boxPos[1].x && box[i].y == boxPos[1].y) {
			return i;
		}
	}
	
	return -1;
}

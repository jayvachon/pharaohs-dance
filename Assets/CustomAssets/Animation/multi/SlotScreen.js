#pragma strict

// Window values
/*private var width : int;
private var height : int;
private var center : int;
private var middle : int;

private var texWhite : Texture2D;
private var texBlack : Texture2D;

private var slotSize : int = 100;
private var slotText : String[] = [ "Slot 1", "Slot 2", "Slot 3" ];
private var slotPositions : Vector2[] = new Vector2[3];

var textStyle : GUIStyle;

function Start () {

	width = Screen.width;
	height = Screen.height;
	center = width / 2;
	middle = height / 2;
	
	texWhite = CreateTextureFromColor(Color.white);
	texBlack = CreateTextureFromColor(Color.black);
	
	for (var i = 0; i < slotPositions.Length; i ++) {
		slotPositions[i].y = middle;
	}
	
	var spacing : int = (slotSize * 0.25);
	slotPositions[0].x = center - slotSize - spacing;
	slotPositions[1].x = center;
	slotPositions[2].x = center + slotSize + spacing;
	
}

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

function OnGUI () {
	DrawBackground();
}

function DrawBackground () {
	GUI.DrawTexture(Rect(0, 0, width, height), texWhite);
}

function DrawSlots () {
	for (var i = 0; i < slotPositions.Length; i ++) {
		DrawSlot(i);
	}
}

function DrawSlot (index : int) {

	DrawSlotTitle(index, slotPosition[index]);
	DrawSlotBox(slotPositions[index]);
	
}

function DrawSlotTitle (index : int, position : Vector2) {
	GUI.Label(Rect(position.x, position.y - (slotSize / 2), 0, 0), slotText[index], textStyle);
}

function DrawSlotBox (position : Vector2) {
	GUI.DrawTexture(CenteredRect(position.x, position.y, slotSize, slotSize), texBlack);
}*/
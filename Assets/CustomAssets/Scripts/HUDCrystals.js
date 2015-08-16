#pragma strict

private class HUDCrystalScreenDimensions {
	var width : int;
	var height : int;
	var center : int;
	var middle : int;
	var top : int;
	var bottom : int;
	var left : int;
	var right : int;
	
	function HUDCrystalScreenDimensions () {
		width = Screen.width;
		height = Screen.height;
		center = width / 2;
		middle = height / 2;
		
		top    = middle - (height / 2);
		bottom = middle + (height / 2);
		left   = center - (width / 2);
		right  = center + (width / 2);
	}
}

private var screenDimensions : HUDCrystalScreenDimensions = new HUDCrystalScreenDimensions ();
public var hud : HUD;
public var crystalTex : Texture2D;
public var countStyle : GUIStyle;

private var crystalSize : int = 60;
private var sep : int = 8;
private var crystals : int[] = new int[7];
private var slots : Rect[] = new Rect[6];

private var stomachFull : boolean = false;

function Start () {
	
	var maxWidth : float = 1152.0;
	var ratio : float = Mathf.Lerp(0.0, 1.0, (Screen.width + 0.0) / maxWidth);
	crystalSize *= ratio;
	sep *= ratio;
	countStyle.fontSize *= ratio;
	
	SetMessages ();
	InitCrystals ();
	InitSlots ();
}

function InitCrystals () {
	for (var i : int = 0; i < 7; i ++) {
		crystals[i] = 0;
	}
}

function InitSlots () {
	for (var i : int = 0; i < 6; i ++) {
		slots[i] = new Rect (screenDimensions.right - ((crystalSize + sep) * (i + 1)),
							 screenDimensions.bottom - (crystalSize + sep),
							 crystalSize, 
							 crystalSize);
	}
}

function SetMessages () {
	Messenger.instance.Listen ("collect_crystal", this);
	Messenger.instance.Listen ("empty_stomach", this);
	Messenger.instance.Listen ("update_inventory", this);
}

function OnGUI () {
	if (hud.startScreen || hud.crystalUp) return;
	DrawCrystals ();
}

function DrawCrystals () {
	var slot : int = 0;
	var textColor : Color = CustomColor.yellow;
	if (stomachFull) textColor = CustomColor.red + CustomColor.dkgrey;
	for (var i = 1; i < 7; i ++) {
		if (crystals[i] > 0) {
			
			GUI.color = Color.black;
			var shadow : Rect = slots[slot];
			shadow.x += 4;
			shadow.y += 4;
			GUI.DrawTexture (shadow,
							 crystalTex,
							 ScaleMode.ScaleToFit);
			
			GUI.color = CustomColor.colorProgression[i];
			GUI.DrawTexture (slots[slot],
							 crystalTex,
							 ScaleMode.ScaleToFit);
			
			if (crystals[i] > 1)
				GUIPlus.LabelWithShadow (slots[slot], "x" + crystals[i].ToString(), countStyle, textColor);
			slot ++;
		}
	}
}

function UpdateCrystalsCount () {
	yield WaitForFixedUpdate ();
	for (var i = 1; i < 7; i ++) {
		crystals[i] = Inventory.instance.crystals[i];
	}
	stomachFull = Inventory.instance.IsStomachFull ();
}

function _CollectCrystal () {
	UpdateCrystalsCount ();
}

function _EmptyStomach () {
	UpdateCrystalsCount ();
}

function _UpdateInventory () {
	UpdateCrystalsCount ();
}


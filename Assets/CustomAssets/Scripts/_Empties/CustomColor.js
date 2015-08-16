#pragma strict

static var red : Color;
static var blue : Color;
static var green : Color;
static var dkgreen : Color;
static var yellow : Color;
static var violet : Color;
static var white : Color;
static var ltgrey : Color;
static var grey : Color;
static var dkgrey : Color;
static var black : Color;
static var lime : Color;
static var orange : Color;

static var colorProgression : Color[];

function Awake () {
	
	red = Color255(194, 19, 41); 		//#c21329
	blue = Color255(14, 173, 251);		//#0eadfb
	green = Color255(110, 170, 23);		//#6eaa17
	yellow = Color255(237, 194, 44);	//#edc22c
	violet = Color255(140, 78, 224);	//#8c4ee0
	orange = Color255(231, 118, 23);	//#e77617
	
	//CreatePalette("e12e3f", "3a34a2", "22a758", "e8db30", "602a9d", "e85330");
	
	lime = Color255(189, 234, 37);
	
	
	dkgreen = green * blue;
	
	white = Color255(251, 251, 252);
	ltgrey = Color255(200, 200, 201);
	grey = Color255(163, 163, 164);
	dkgrey = Color255(100, 100, 101);
	black = Color255(35, 35, 36);
	
	colorProgression = new Color[18];
	colorProgression[0] = red;
	colorProgression[1] = violet;
	colorProgression[2] = blue;
	colorProgression[3] = green;
	colorProgression[4] = yellow;
	colorProgression[5] = orange;
	colorProgression[6] = white;
	colorProgression[7] = black;
	colorProgression[8] = red;
	
	colorProgression[9] = red;
	colorProgression[10] = violet;
	colorProgression[11] = blue;
	colorProgression[12] = green;
	colorProgression[13] = lime;
	colorProgression[14] = yellow;
	colorProgression[15] = orange;
	colorProgression[16] = grey;
	colorProgression[17] = white;
	
}

function Color255 (r : int, g : int, b : int) : Color {
    return Color(r / 255.0, g / 255.0, b / 255.0);
}

/*function CreatePalette (r : String, b : String, g : String, y : String, v : String, o : String) {
	red = HexToRGB(r);
	blue = HexToRGB(b);
	green = HexToRGB(g);
	yellow = HexToRGB(y);
	violet = HexToRGB(v);
	orange = HexToRGB(o);
}

function HexToInt (hexChar : char) {
	var hex : String = "" + hexChar;
	switch (hex) {
		case "0": return 0;
		case "1": return 1;
		case "2": return 2;
		case "3": return 3;
		case "4": return 4;
		case "5": return 5;
		case "6": return 6;
		case "7": return 7;
		case "8": return 8;
		case "9": return 9;
		case "a":
		case "A": return 10;
		case "b":
		case "B": return 11;
		case "c":
		case "C": return 12;
		case "d":
		case "D": return 13;
		case "e":
		case "E": return 14;
		case "f":
		case "F": return 15;
	}
	return 0;
}

function HexToRGB (color : String) {
	var r = (HexToInt(color[1]) + HexToInt(color[0]) * 16.000) / 255;
	var g = (HexToInt(color[3]) + HexToInt(color[2]) * 16.000) / 255;
	var b = (HexToInt(color[5]) + HexToInt(color[4]) * 16.000) / 255;
	var finalColor = new Color();
	finalColor.r = r;
	finalColor.g = g;
	finalColor.b = b;
	finalColor.a = 1;
	return finalColor;
}*/
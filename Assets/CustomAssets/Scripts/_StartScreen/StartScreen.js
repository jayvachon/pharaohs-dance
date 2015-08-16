#pragma strict

public var demo : boolean = false;
public var webVersion : boolean = false;
private var demoQuit : boolean = false;

public var tutorial : Tutorial;

public var colorBalance : ColorBalance;
public var stats : Stats;
private var statsUp : boolean = false;

public var select : GameObject;
private var selectPitch : FXPitch;

var startScreenCam : Camera;
var texTextBack : Texture2D;
var texShadow : Texture2D;
var texEdgeL : Texture2D;
var texEdgeR : Texture2D;
var optionStyle : GUIStyle;

var scroller : GameObject;

private var screen : int = 0;	// specifies which set of options to show
private var prevScreen : int = 0;
private var prevScreen2 : int = 0; // For when we need to go 2 layers back

private var messages : String[] = [  "Game paused",
									 "DEAD! You have suffocated!",
						 			 "DEAD! You have fallen into the abyss!",
						 			 "Are you sure?",
						 			 "Overwrite save?",
						 			 "Start with Tutorial?" ];
private var diedMessage : int = 0;

private var messageY : int;
private var timeY : int;
private var myTime : float;
private var timeMessage : String;

public enum ScreenSet {
	main,
	difficulty,
	pause,
	death,
	settings,
	mainPause,
	areYouSure,
	play,
	loadsave,
	overwrite,
	unlockables,
	tutorial
}

private var options = [ [ "Play", "Difficulty", "Settings", "Stats", "Unlockables", "Quit" ],
						[ "Back", "Casual", "Normal", "Intense", "Insane" ],
						[ "Resume", "Main Menu" ],
						[ "Restart", "Main Menu" ],
						[ "Back", "Shadows: ", "Filter: " ],
						[ "Resume", "Restart", "Settings", "Stats", "Quit" ],
						[ "No", "Yes" ],
						[ "New", "Load", "Back" ],
						[ "Slot 1", "Slot 2", "Slot 3", "Slot 4", "Back" ],
						[ "No", "Yes" ],
						[ "Back", "Hat: ", "Shrinking: ", "White: " ],
						[ "Yes", "No" ] ];
						
private var restartOnPlay : boolean = false;	// if the player has come to the main menu from the pause or death screens, we don't restart the game unless s/he then presses play
private var areYouSureAction : int = 0;			// 0 for restart, 1 for quit
private var newGame : boolean = false;			// if true, show the "New Game" menu. If false, show the "Load Game" menu

private var unlockables : boolean[];
private var unlockableOn : boolean[] = [ false, false, false ];
private var difficulty : int = 1;

private var screens : MenuOptionSet[];

private var selection : int = 0;

private var blinkColor : Color;
var pulseWidth : float = 0.0;

static var instance : StartScreen;
private var screenUp : boolean = true;

private var texBlack : Texture2D;
private var texBlackSolid : Texture2D;

private var saveSlots : boolean[] = new boolean[4];
private var slotSelection : int = 0;
private var saveSlot : int = 0;

private var drawLoadScreen : boolean = false;

// Window values
private var width : int;
private var height : int;
private var center : int;
private var middle : int;
private var border : int = 12;

private var fullScreen : Rect;

private var screenAverage : float;			// Percentage of average width & height of screen compared to a maximum size screen

private var player : Player;

class MenuOptionSet extends System.Object {
	
	private var width : int;
	private var height : int;
	private var screenAverage : float;
	private var options : String[];
	private var opRadius : float;
	private var snapPoint : Vector2[];
	private var textPoint : Vector2[];
	private var textDimensions : Vector2[];
	private var fontSize : int;
	
	private var optionStyle : GUIStyle;
	private var bulge : float = 1.5;
	private var colorBalance : ColorBalance;
	
	function MenuOptionSet (_width : int, _height : int, _options : String[], _optionStyle : GUIStyle, _screenAverage : float, _colorBalance : ColorBalance) {
		
		width = _width;
		height = _height;
		options = _options;
		optionStyle = _optionStyle;
		screenAverage = _screenAverage;
		colorBalance = _colorBalance;
		
		opRadius = (height + 0.0) * 0.33;
		bulge = Mathf.Min((width + 0.0) / (height + 0.0), 1.67);
		
		/*var maxFont : int = optionStyle.fontSize;
		fontSize = Mathf.Lerp(2.0, maxFont + 0.0, screenAverage);
		optionStyle.fontSize = fontSize;*/
		
		snapPoint = new Vector2[options.Length];
		textPoint = new Vector2[options.Length];
		textDimensions = new Vector2[options.Length];
		
		var deg : float = 360.0 / options.Length;
		var offset : float = -90.0;
		if (options.Length <= 2) {
			offset = 180.0;
		}
		
		for (var i = 0; i < options.Length; i ++) {
			var rad : float = (i * deg) * Mathf.Deg2Rad;
			snapPoint[i].x = Mathf.Cos(rad) * opRadius;
			snapPoint[i].y = Mathf.Sin(rad) * opRadius;	
			
			rad = ((i * deg) + offset) * Mathf.Deg2Rad;
			textPoint[i].x = Mathf.Cos(rad) * (opRadius * bulge);
			textPoint[i].y = Mathf.Sin(rad) * (opRadius);	
			
			var toggle : String = "";
			if (options[i] == "Shadows: " || 
				options[i] == "Filter: " || 
				options[i] == "Hat: " || 
				options[i] == "Shrinking: " || 
				options[i] == "White: ") {
				
				toggle = "Off";
			}
			
			textDimensions[i] = optionStyle.CalcSize(new GUIContent(options[i] + toggle));
		}
	}
	
	function GetTextPoint (index : int) : Vector2 {
		return textPoint[index];
	}
	
	function GetOptionText (index : int) : String {
		var toggle : String = "";
		if (options[index] == "Shadows: ") {
			if (GameController.instance.ShadowsEnabled()) {
				toggle = "On";
			} else {
				toggle = "Off";
			}
		}
		
		if (options[index] == "Filter: ") {
			if (colorBalance.enabled) {
				toggle = "On";
			} else {
				toggle = "Off";
			}
		}
		
		return options[index] + toggle;
	}
	
	function GetOptionText (index : int, unlockables : boolean[], unlockableOn : boolean[]) {
		var toggle : String = "";
		if (options[index] == "Hat: " || options[index] == "Shrinking: " || options[index] == "White: ") {
			if (unlockableOn[index - 1]) {
				toggle = "On";
			} else {
				toggle = "Off";
			}
			if (!unlockables[index - 1]) {
				if (options[index] == "Hat: ")
					return "Hat";
				if (options[index] == "Shrinking: ")
					return "Shrinking";
				if (options[index] == "White: ")
					return "White";
			}
		}
		
		return options[index] + toggle;
	}
	
	function GetTextDimensions (index : int) : Vector2 {
		return textDimensions[index];
	}
	
	function GetTextHeight (index : int) : int {
		return optionStyle.CalcHeight(new GUIContent("Ij"), GetTextDimensions(index).x);
	}
	
	function GetSnapPoint (index : int) : Vector2 {
		return snapPoint[index];
	}
	
	function GetOptionsCount () {
		return options.Length;
	}
	
}

function Awake () {
	instance = this;
	myTime = 0.0;
}

function Start () {
	
	SetUnlockableButton (false);
	
	selectPitch = select.GetComponent (FXPitch);
	player = GameObject.FindGameObjectWithTag("Player").GetComponent(Player);
	
	width = Screen.width;
	height = Screen.height;
	center = width / 2;
	middle = height / 2;
		
	fullScreen = Rect(0, 0, width, height);
	
	var col : Color = CustomColor.black;
	col.a = 0.75;
	texBlack = CreateNewTextureFromColor(col);
	texBlackSolid = CreateNewTextureFromColor (Color.black);
	
	StartCoroutine(Blink(0.05));

	animation.Play("StartPulse");
	
	// Sets the size of the scroller based on our window size
	var maxWidth : float = 1600.0;	// These are arbitrary values & could probably be set higher
	var maxHeight : float = 800.0;
	screenAverage = (((width + 0.0) / maxWidth) + ((height + 0.0) / maxHeight) / 2.0);
	startScreenCam.fieldOfView = Mathf.Lerp(110.0, 55.0, screenAverage);
	
	// Set the font size for different resolutions
	var mW : float = 1152.0;
	optionStyle.fontSize *= Mathf.Lerp(0.0, 1.0, (Screen.width + 0.0) / mW);
	
	// Create our menus
	screens = new MenuOptionSet[options.Length];
	for (var i = 0; i < options.Length; i ++) {
		screens[i] = new MenuOptionSet(width, height, options[i], optionStyle, screenAverage, colorBalance);
	}
	
	// Set message position
	messageY = height / 5;
	timeY = height - (height / 5);
	
	Messenger.instance.Listen("restart_game", this);
	
	SetSaveSlots ();
	
}

function SetUnlockableButton (newScreen : boolean) {
	if (!SaveGameManager.HasUnlockables()) {
		options[0] = [ "Play", "Difficulty", "Settings", "Stats", "Quit" ];
	} else {
		options[0] = [ "Play", "Difficulty", "Settings", "Stats", "Unlockables", "Quit" ];
	}
	if (newScreen) {
		screens[0] = new MenuOptionSet(width, height, options[0], optionStyle, screenAverage, colorBalance);
	}
	unlockables = SaveGameManager.LoadUnlockables ();
}

function SetSaveSlots () {
	for (var i = 0; i < saveSlots.Length; i ++) {
		saveSlots[i] = SaveGameManager.SlotHasSave (i);
	}
}

function HasSaves () : boolean {
	for (var i = 0; i < saveSlots.Length; i ++) {
		if (saveSlots[i]) return true;
	}
	return false;
}

function CreateNewTextureFromColor (col : Color) : Texture2D {
	var t : Texture2D;
	t = new Texture2D(1, 1);
	t.SetPixel(0, 0, col);
	t.wrapMode = TextureWrapMode.Repeat;
	t.Apply();
	return t;
}

function QuitGame () {
	SaveGameManager.instance.QuitGame ();
}

function Update () {
	
	if (demoQuit) {
		if (Input.anyKeyDown) {
			if (Input.GetKeyDown (KeyCode.Space)) {
				Application.OpenURL ("http://www.astroassembly.com/pharaohs-dance/#download");
			} else {
				QuitGame ();
				//Application.Quit ();
			}
		}
		return;
	}
	
	if (!screenUp && !statsUp) return;
	if (Input.GetButtonDown("Jump") || Input.GetKeyDown (KeyCode.Return)) {
		if (!statsUp)
			Select(screen);
		else {
			CloseStats ();
			PlaySelect (3);
		}
	}
	if (Input.GetButtonDown("MenuClose") || Input.GetKeyDown (KeyCode.Escape)) {
		if (statsUp) {
			CloseStats ();
			if (screen == ScreenSet.mainPause) {
				ResumeGame ();
			}
			PlaySelect (3);
		}
	}
	
	//myTime += Time.deltaTime;
}

function Select (scr : int) {
	if (screenUp) {
		
		if (scr == ScreenSet.main) {
			switch (selection) {
				case 0 : /*screenUp = false;					// Play
						 new MessageCloseStartscreen();
						 startScreenCam.gameObject.SetActive(false);
						 if (restartOnPlay) {
						 	new MessageRestartGame();
						 	restartOnPlay = false;
						 }*/
						 if (webVersion) {
							 PlaySelect (1);
							 screen = ScreenSet.tutorial;
							 //PlayGame (false);
						 } else {
							 prevScreen = screen;
							 screen = ScreenSet.play;
							 PlaySelect (0);
						 }
						 break;
				case 1 : screen = ScreenSet.difficulty; 	// Difficulty
						 PlaySelect (3);
						 break;
				case 2 : prevScreen = screen;				// Settings
						 screen = ScreenSet.settings;	
						 PlaySelect (2);	
						 break;
				case 3 : ShowStats ();						// Stats	
						 PlaySelect (1);
						 break;									
				case 4 : if (options[0].Length == 6) {
							 prevScreen = screen;			// Unlockables
							 screen = ScreenSet.unlockables;
							 PlaySelect (3);
						 } else {
							 prevScreen = screen;				// Quit
							 areYouSureAction = 1;
							 screen = ScreenSet.areYouSure;
							 PlaySelect (2);
						 }
						 break;
				case 5 : prevScreen = screen;				// Quit
						 areYouSureAction = 1;
						 screen = ScreenSet.areYouSure;
						 PlaySelect (2);
						 break;
			}
		}
		
		if (scr == ScreenSet.unlockables) {
			if (selection == 0) {
				screen = prevScreen;
				PlaySelect (1);
			} else {
				unlockableOn [selection - 1] = !unlockableOn [selection - 1];
				PlaySelect (2);
			}
			
			switch (selection) {
				case 1 : break;	// Hat
				case 2 : Wheel.instance.SetShrink (unlockableOn [selection - 1]);
						 break;	// Shrinking
				case 3 : Wheel.instance.SetWhiteOnly (unlockableOn [selection - 1]);
						 break;	// White
			}
		}
		
		if (scr == ScreenSet.difficulty) {
			if (selection == 0) {							// Back
				screen = ScreenSet.main;
				PlaySelect (1);
			} else {										// Difficulty options
				difficulty = selection - 1;
				GameController.instance.SetDifficulty(difficulty);
				PlaySelect (difficulty + 1);
			}
		}
		
		/*if (scr == ScreenSet.pause) {
			switch (selection) {
				case 0 : screenUp = false;					// Resume
						 new MessageCloseStartscreen();
						 startScreenCam.gameObject.SetActive(false);
						 GameController.instance.ResumeGame();
						 PlaySelect (0);
						 break;
				case 1 : screen = ScreenSet.mainPause;		// Main menu
						 PlaySelect (3);
						 break;
			}
		}*/
		
		if (scr == ScreenSet.death) {
			switch (selection) {
				case 0 : //RestartGame();						// Restart
						 if (webVersion) {
						 	PlaySelect (0);
						 	RestartGame ();
						 } else {
							 prevScreen = screen;
							 screen = ScreenSet.play;
							 restartOnPlay = true;
							 PlaySelect (0);
						 }
						 break;
				case 1 : screen = ScreenSet.main;			// Main menu
						 restartOnPlay = true;
						 PlaySelect (3);
						 break;
			}
		}
		
		if (scr == ScreenSet.settings) {
			switch (selection) {
				case 0 : screen = prevScreen;								// Back
						 PlaySelect (1);
						 break;					
				case 1 : GameController.instance.ToggleShadows(); 			// Shadows
						 PlaySelect (2);
						 break;	
				case 2 : colorBalance.enabled = !colorBalance.enabled;		// Screen Filter
						 PlaySelect (2);
						 break;
			}
		}
		
		if (scr == ScreenSet.mainPause) {
			switch (selection) {
				case 0 : ResumeGame ();
						 /*screenUp = false;					// Resume
						 new MessageCloseStartscreen();
						 startScreenCam.gameObject.SetActive(false);
						 GameController.instance.ResumeGame();*/
						 PlaySelect (0);
						 break;
				case 1 : //areYouSureAction = 0;					// Restart
						 if (webVersion) {
						 	PlaySelect (3);
						 	prevScreen = screen;
						 	screen = ScreenSet.areYouSure;
						 	restartOnPlay = true;
						 } else {
							 prevScreen = screen;
							 //areYouSureAction = 0;
							 //screen = ScreenSet.areYouSure;
							 screen = ScreenSet.play;
						 	 restartOnPlay = true;
							 PlaySelect (3);
						 }
						 break;
				case 2 : prevScreen = screen;
						 screen = ScreenSet.settings;		// Settings
						 PlaySelect (2);
						 break;
				case 3 : ShowStats ();						// Stats
						 PlaySelect (1);
						 break;								
				case 4 : areYouSureAction = 1;				// Quit
					     prevScreen = screen;
					     screen = ScreenSet.areYouSure;
					     PlaySelect (3);
						 break;
			}
		}
		
		if (scr == ScreenSet.areYouSure) {
			switch (selection) {
				case 0 : screen = prevScreen;				// No
						 PlaySelect (1);
						 break;
				case 1 : if (areYouSureAction == 0) {		// Yes
							 if (webVersion) {
						 	 	RestartGame();
						 	 } else {
							 	 screen = ScreenSet.play;
							 	 restartOnPlay = true;
						 	 }
						 } else {
						 	if (!demo)
							 	QuitGame (); //Application.Quit();
							 else
							 	demoQuit = true;
						 }
						 PlaySelect (0);
						 break;
			}
		}
		
		if (scr == ScreenSet.play) {
			switch (selection) {
				case 0 : prevScreen2 = screen;					// New
						 screen = ScreenSet.loadsave;			
						 newGame = true;
						 PlaySelect (1);
						 break;
				case 1 : prevScreen2 = screen;					// Load
						 screen = ScreenSet.loadsave;			
						 newGame = false;
						 PlaySelect (2);
						 break;
				case 2 : screen = prevScreen;					// Back
						 PlaySelect (3);
						 break;									
			}
		}
		
		if (scr == ScreenSet.loadsave) {
			if (selection == 4) {								// Back
				screen = prevScreen2;
				PlaySelect (1);
			} else {											// Slot options
				PlaySelect (selection + 1);
				// Start a new game
				if (newGame) {
					if (saveSlots[selection]) {
						slotSelection = selection;
						screen = ScreenSet.overwrite;
					} else {
						//SaveGameManager.instance.SetSlot (selection, true);
						//PlayGame (false);
						saveSlot = selection;
						screen = ScreenSet.tutorial;
					}
				// Load a previously saved game
				} else {
					if (saveSlots[selection]) {
						SaveGameManager.instance.SetSlot (selection, false);
						tutorial.Deactivate ();
						PlayGame (true);
					}
				}
			}
		}
		
		if (scr == ScreenSet.overwrite) {
			switch (selection) {
				case 0 : screen = ScreenSet.loadsave;			// No
						 PlaySelect (2);
						 break;
				case 1 : //SaveGameManager.instance.SetSlot (slotSelection, true);	// Yes
						 //PlayGame (false);
						 PlaySelect (1);
						 screen = ScreenSet.tutorial;
						 break;
			}
		}
		
		if (scr == ScreenSet.tutorial) {
			switch (selection) {
				case 0 : 	tutorial.Activate ();							// Show tutorial & play
							break;	
				case 1 : 	tutorial.Deactivate ();							// Just play
							break;							
			}
			SaveGameManager.instance.SetSlot (saveSlot, true);
			PlaySelect (0);
			PlayGame (false);
		}
	}
}

function PlaySelect (pitch : int) {
	selectPitch.SetPitch (pitch);
	AudioManager.PlayElement ("Select", new PlaySettings(AudioManager.GetMetronome("Main"), 0.25));
}

function PlayGame (loading : boolean) {
	screenUp = false;					
	new MessageCloseStartscreen();
	startScreenCam.gameObject.SetActive(false);
	ShowLoadScreen ();
	if (restartOnPlay && !loading) {
		//ShowLoadScreen ();
		yield WaitForFixedUpdate ();
		new MessageRestartGame();
		restartOnPlay = false;
	} 
	if (loading) {
		//ShowLoadScreen ();
		yield WaitForFixedUpdate ();
		new MessageLoadGame ();
	}
}

function RestartGame () {
	ShowLoadScreen ();
	yield WaitForFixedUpdate ();
	screenUp = false;					
	new MessageCloseStartscreen();
	startScreenCam.gameObject.SetActive(false);
	GameController.instance.ResumeGame();
	new MessageRestartGame();
}

function ResumeGame () {
	screenUp = false;					
	new MessageCloseStartscreen();
	startScreenCam.gameObject.SetActive(false);
	GameController.instance.ResumeGame();
}

function ResumeGameFromController () {
	screenUp = false;					
	new MessageCloseStartscreen();
	startScreenCam.gameObject.SetActive(false);
}

function ShowStats () {
	stats.OpenStats ();
	screenUp = false;
	statsUp = true;
	startScreenCam.gameObject.SetActive(false);
	scroller.gameObject.SetActive(false);
}

function CloseStats () {
	stats.CloseStats ();
	screenUp = true;
	statsUp = false;
	startScreenCam.gameObject.SetActive(true);
	scroller.gameObject.SetActive(true);
}

function OnGUI () {
	if (demoQuit) {
		DrawBackground (texBlackSolid);
		DrawTextWithShadow (center, middle, "Thanks for playing!\nIf you liked it, press Spacebar\nto visit the preorder site.\n\nOr press any other key to quit.");
		return;
	}
	
	if (screenUp) {
		DrawBackground();
		DrawOptions();
		startScreenCam.Render();
		if (screen == ScreenSet.pause) {
			DrawMessage(0);
			DrawTime();
		}
		if (screen == ScreenSet.death) {
			DrawMessage(diedMessage);
			DrawTime();
		}
		if (screen == ScreenSet.areYouSure) {
			DrawMessage(3);
			if (!webVersion) {
				DrawBottomMessage ("Any unsaved progress will be lost!");
			}
		}
		if (screen == ScreenSet.overwrite) {
			DrawMessage(4);
		}
		if (screen == ScreenSet.tutorial) {
			DrawMessage(5);
		}
	}
	
	if (drawLoadScreen) {
		DrawLoading ();
	}
}

function ShowLoadScreen () {
	drawLoadScreen = true;
	yield WaitForFixedUpdate ();
	drawLoadScreen = false;
}

function DrawLoading () {
	DrawBackground (texBlackSolid);
	DrawTextWithShadow(center, middle, "loading\n(this will take a minute)");
}

function DrawMessage (msg: int) {
	DrawTextBackground(center, messageY, messages[msg]);
	DrawTextWithShadow(center, messageY, messages[msg]);
}

function DrawTime () {
	DrawTextBackground(center, timeY, timeMessage);
	DrawTextWithShadow(center, timeY, timeMessage);
}

function DrawBottomMessage (msg : String) {
	DrawTextBackground(center, timeY, msg);
	DrawTextWithShadow(center, timeY, msg);
}

function GetTime () {
	var s : float = myTime;
	
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
	
	timeMessage = h.ToString() + ":" + m.ToString() + ":" + s.ToString("#.0");
}

function DrawOptions () {
	for (var i = 0; i < screens[screen].GetOptionsCount(); i ++) {
		var x : int = center + screens[screen].GetTextPoint(i).x;
		var y : int = middle + screens[screen].GetTextPoint(i).y;
		DrawTextBackground(x, y, i, i == selection);
		DrawTextWithShadow(x, y, i, i == selection);
	}
}

function DrawTextWithShadow (x : int, y : int, option : int, selected : boolean) {
	GUI.color = CustomColor.black;
	var text : String = screens[screen].GetOptionText(option);
	if (screen == ScreenSet.unlockables) {
		text = screens[screen].GetOptionText(option, unlockables, unlockableOn);
	}
	GUI.Label(Rect(x + 2, y + 2, 0, 0), /*screens[screen].GetOptionText(option)*/ text, optionStyle);
	
	GUI.color = CustomColor.white;
	if (selected)
		GUI.color = blinkColor;
	GUI.Label(Rect(x, y, 0, 0), /*screens[screen].GetOptionText(option)*/ text, optionStyle);
}

function DrawTextWithShadow (x : int, y : int, msg : String) {
	GUI.color = Color.black;
	GUI.Label(Rect(x + 2, y + 2, 0, 0), msg, optionStyle);
	
	GUI.color = CustomColor.white;
	GUI.Label(Rect(x, y, 0, 0), msg, optionStyle);
}

function DrawTextBackground (x : int, y : int, option : int, selected : boolean) {
	
	var w : int = screens[screen].GetTextDimensions(option).x;// * screenAverage * 0.75; 
	var h : int = screens[screen].GetTextDimensions(option).y * 1.33;// * screenAverage; 
	var side : int = h / 2.0; //40.0 * screenAverage;
	
	if (selected) {
		w += pulseWidth * 2;
		h += pulseWidth;
		side += pulseWidth / 2;
	}
	
	var left : int = x - (w / 2) - side;
	var right : int = x + (w / 2);
	var top : int = y - (h / 2);
	
	GUI.color = Color.black;
	
	var offset : int = 2;
	GUI.DrawTexture(Rect(left + offset, top + offset, side, h), texEdgeL, ScaleMode.StretchToFill);
	GUI.DrawTexture(Rect(left + side + offset, top + offset, w, h), texTextBack, ScaleMode.StretchToFill);
	GUI.DrawTexture(Rect(right + offset, top + offset, side, h), texEdgeR, ScaleMode.StretchToFill);
	
	GUI.color = CustomColor.red;
	
	// hack that indicates which difficulty setting we're on	
	if (screen == ScreenSet.difficulty) {
		if (option == difficulty + 1) {
			GUI.color = CustomColor.yellow;
		}
	}
	
	// another hack for save slots
	if (screen == ScreenSet.loadsave) {
		if (option < saveSlots.Length) {
			if (!newGame) {
				if (!saveSlots[option]) {
					GUI.color = CustomColor.dkgrey;
				}
			} else {
				if (saveSlots[option]) {
					GUI.color = CustomColor.yellow;
				}
			}
		}
	}
	
	// aaand a hack for unlockables
	if (screen == ScreenSet.unlockables) {
		if (option > 0) {
			if (unlockables[option - 1]) {
				if (unlockableOn[option - 1]) {
					GUI.color = CustomColor.yellow;
				} else {
					GUI.color = CustomColor.red;
				}
			} else {
				GUI.color = CustomColor.dkgrey;
			}
		}
	}
	
	GUI.DrawTexture(Rect(left, top, side, h), texEdgeL, ScaleMode.StretchToFill);
	GUI.DrawTexture(Rect(left + side, top, w, h), texTextBack, ScaleMode.StretchToFill);
	GUI.DrawTexture(Rect(right, top, side, h), texEdgeR, ScaleMode.StretchToFill);
	
}

function DrawTextBackground (x : int, y : int, msg : String) {
	
	var msgDimensions : Vector2 = optionStyle.CalcSize(new GUIContent(msg));
	var w : int = msgDimensions.x;// * screenAverage * 0.75; 
	var h : int = msgDimensions.y * 1.33;// * screenAverage; 
	var side : int = h / 2.0; //40.0 * screenAverage;
	
	/*var w : int = msgDimensions.x * screenAverage * 0.75; 
	var h : int = msgDimensions.y * screenAverage; 
	var side : int = 40.0 * screenAverage;*/
	
	var left : int = x - (w / 2) - side;
	var right : int = x + (w / 2);
	var top : int = y - (h / 2);

	GUI.color = CustomColor.black;	
	
	GUI.DrawTexture(Rect(left, top, side, h), texEdgeL, ScaleMode.StretchToFill);
	GUI.DrawTexture(Rect(left + side, top, w, h), texTextBack, ScaleMode.StretchToFill);
	GUI.DrawTexture(Rect(right, top, side, h), texEdgeR, ScaleMode.StretchToFill);
	
}

function Blink (speed : float) {
	while (true) {
		blinkColor = CustomColor.yellow;
		yield WaitForSeconds(speed);
		blinkColor = CustomColor.black;
		yield WaitForSeconds(speed);
		blinkColor = CustomColor.white;
		yield WaitForSeconds(speed);
		blinkColor = CustomColor.black;
		yield WaitForSeconds(speed);
	}
}

function DrawBackground () {
	GUI.DrawTexture(fullScreen, texBlack, ScaleMode.StretchToFill, true, 0);
}

function DrawBackground (t : Texture2D) {
	GUI.DrawTexture(fullScreen, t, ScaleMode.StretchToFill, true, 0);
}

function GetOptionsCount () : int {
	return screens[screen].GetOptionsCount(); 
}

function GetSnapPoint (i : int) : Vector2 {
	return screens[screen].GetSnapPoint(i);
}

function GetScreen () {
	return screen;
}

function ShowPauseScreen () {
	GetTime();
	screen = ScreenSet.mainPause;
	screenUp = true;
	startScreenCam.gameObject.SetActive(true);
	scroller.gameObject.SetActive(true);
	scroller.GetComponent(StartScreenScroller).Start();
	SetSaveSlots ();
	new MessageOpenStartscreen();
}

function ShowDiedScreen () {
	GetTime();
	if (player.IsAirEmpty()) {
		diedMessage = 1;
	} else {
		diedMessage = 2;
	}
	screen = 3;
	screenUp = true;
	startScreenCam.gameObject.SetActive(true);
	scroller.gameObject.SetActive(true);
	scroller.GetComponent(StartScreenScroller).Start();
	SetSaveSlots ();
	new MessageOpenStartscreen();
}

function ShowStartScreen () {
	screen = 0;
	screenUp = true;
	restartOnPlay = true;
	startScreenCam.gameObject.SetActive(true);
	scroller.gameObject.SetActive(true);
	scroller.GetComponent(StartScreenScroller).Start();
	SetSaveSlots ();
	SetUnlockableButton (true);
	new MessageOpenStartscreen();
}

function IsScreenUp () : boolean {
	return screenUp;
}

function SetSelection (s : int) {
	selection = s;
}

function _RestartGame () {
	myTime = 0.0;
}
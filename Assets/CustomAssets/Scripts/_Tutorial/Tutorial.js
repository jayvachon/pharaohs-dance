#pragma strict

public var cam : Camera;
public var models : GameObject;

private var showTutorial : boolean = false;			// We won't show the tutorial if the player restarts the game & has seen the whole tutorial
private var screenUp : boolean = false;

private var screen : int = 0;						// Which screen to display
private var screenShown = new boolean[9];
private var screenCount : int = 0;

private var controller : CharacterController;
private var input : FPSInputController;
private var timeScale : float = 1.0;
private var okClose : boolean = true;				// After the screen pops up we wait a bit before accepting input from the player 
													// (to avoid the player accidently closing the screen before getting a chance to read it)

public enum TutorialScreen {
	Start,
	Air,
	Discs,
	Pipes,
	Bonuses,
	Spinning,
	Stomach,
	Falls,
	GetAir
}

var textures : Textures;
var screenDimensions : ScreenDimensions;
var draw : Draw;

var titleStyle : GUIStyle;
var textStyle : GUIStyle;

class Textures {

	@System.NonSerialized
	public var black : Texture2D;
	
	function Start () {
		black = GUIPlus.CreateTextureFromColor(CustomColor.black);
	}

}

class ScreenDimensions {
	
	@System.NonSerialized
	var width : int;
	@System.NonSerialized
	var height : int;
	@System.NonSerialized
	var center : int;
	@System.NonSerialized
	var middle : int;
	@System.NonSerialized
	var top : int;
	@System.NonSerialized
	var bottom : int;
	@System.NonSerialized
	var left : int;
	@System.NonSerialized
	var right : int;
	@System.NonSerialized
	var border : int;
	@System.NonSerialized
	var backgroundSize : float;
	
	function ScreenDimensions () {
		
		backgroundSize = 0.8;
		
		width = Screen.width;
		height = Screen.height;
		center = width / 2;
		middle = height / 2;
		
		top = 	 middle - ((height * backgroundSize) / 2);
		bottom = middle + ((height * backgroundSize) / 2);
		left =  center - ((width * backgroundSize) / 2);
		right = center + ((width * backgroundSize) / 2);
		border = (((height * backgroundSize) / 10) + ((width * backgroundSize) / 10)) / 2;
		
	}
	
}

class Draw extends Tutorial {
	
	private var title : String[] =	[ "Welcome, Pharaoh",
									  "Getting air",
									  "Buttons and Coins",
									  "Piping",
									  "Bonuses",
									  "Also",
									  "Stomach full!",
									  "Recovering from falls",
									  "Get Air!"
									];
		
	/*private var text : String[] =	[ "Step right up and cross the rainbow path to test your skill.\nCan you climb to the top of the giant wheel?",
								      "You're always losing air. Return to the air supply station to refill your tank. Don't get too high before coming back down.",
								      "Before you is a red disc. Jump on the button in the center and collect all the coins that appear.",
								      "Enter the pipe and jump to ascend.",
								      "Other discs produce bonuses like pills and crystals. Pills will slow down time. Crystals can be sold for coins in the shop back across the rainbow path below. Use the money you make to purchase upgrades.",
								      "The wheel is always spinning.",
								      "You can only stuff your stomach with a limited amount of crystals. Return to the shop below to sell them and lighten your load.",
								      "Oops! Looks like you’re falling to your death. Follow the blinking arrows to the center to find a column of trampolines that will bring you back to the air supply station."
								 	];*/
								 	
	private var text : String[] =  [ "Can you reach the top of the giant wheel? Cross the rainbow path to begin.",
									 "You're always losing air. Return to the Air Station to refill your tank.",
									 "Before you is a red disc. Jump on the button and collect all the coins that appear.",
								     "Enter the pipe and jump to ascend to the next row.",
								     "Other discs produce bonuses like Pills, which slow down time, and Crystals, which are sold for coins.",
								     //"Other discs produce bonuses like pills and crystals. Pills slow down time, and crystals can be sold for coins.",
								     "The wheel is always spinning.",
								     "Your stomach can only hold so many crystals. Return to the shop below to sell them for coins.",
								     "Oops! Looks like you’re falling to your death. Follow the blinking arrows to the trampolines and bounce back up to the Air Station.",
								     "You're running out of air! Refill at the Air Station before you suffocate."
								   ];
							
	private var continueText : String = "Spacebar continues"; 	
	private var tiStyle : GUIStyle;
	private var txStyle : GUIStyle;
	
	private var titleColor : Color[] = new Color[9];
							 
	private var backgroundBox : Rect;
	private var textBox : Rect[];
	private var titleBox : Rect[];
	private var progressBox : Rect;
	private var continueBox : Rect;
	private var sd : ScreenDimensions;
	
	function Draw (_sd : ScreenDimensions, _titleStyle : GUIStyle, _textStyle : GUIStyle) {
		tiStyle = _titleStyle;
		txStyle = _textStyle;
		sd = _sd;
		SetColors ();
		CreateBackgroundBox ();
		CreateTextBoxes ();
		CreateTitleBoxes ();
		CreateProgressBox ();
		CreateContinueBox ();
	}
	
	private function SetColors () {
		titleColor[0] = CustomColor.green;
		titleColor[1] = CustomColor.ltgrey;
		titleColor[2] = CustomColor.red;
		titleColor[3] = CustomColor.yellow;
		titleColor[4] = CustomColor.violet;
		titleColor[5] = CustomColor.white;
		titleColor[6] = CustomColor.red;
		titleColor[7] = CustomColor.green;
		titleColor[8] = CustomColor.ltgrey;
	}
	
	private function CreateBackgroundBox () {
	
		backgroundBox = GUIPlus.CenteredRect(sd.center, 
											 sd.middle, 
											 sd.width * sd.backgroundSize, 
											 sd.height * sd.backgroundSize);
	}
	
	private function CreateTextBoxes () {
		var w : int = sd.width * 0.4;
		textBox = new Rect[text.Length];
		for (var i = 0; i < text.Length; i ++) {
			var h : int = txStyle.CalcHeight(new GUIContent(text[i]), w);
			textBox[i] = Rect (sd.right - sd.border - w, sd.middle - (h / 2), w, h);
		}
	}
	
	private function CreateTitleBoxes () {
		var w : int = sd.width * 0.4;
		titleBox = new Rect[title.Length];
		for (var i = 0; i < title.Length; i ++) {
			var h : int = tiStyle.CalcHeight(new GUIContent(title[0]), w);
			titleBox[i] = Rect (sd.right - sd.border - w, textBox[i].y - h, w, h);
		}
	}
	
	private function CreateProgressBox () {
		var border : int = 8;
		var s : Vector2 = txStyle.CalcSize(new GUIContent("8/8."));
		progressBox = Rect (sd.right - s.x - border, sd.top + border, s.x, s.y);
	}
	
	private function CreateContinueBox () {
		var s : Vector2 = txStyle.CalcSize(new GUIContent(continueText));
		continueBox = Rect (sd.center - (s.x / 2), sd.bottom - sd.border, s.x, s.y);
	}
	
	private function Progress (screenCount : int) {
		var t : String = (screenCount + 1) + "/" + text.Length;
		GUIPlus.LabelWithShadow (progressBox, t, txStyle, CustomColor.yellow);
	}
	
	function Content (screen : int, screenCount : int) {
		GUIPlus.LabelWithShadow (titleBox[screen], title[screen], tiStyle, titleColor[screen]);
		GUIPlus.LabelWithShadow (textBox[screen], text[screen], txStyle, CustomColor.white);
		GUIPlus.LabelWithShadow (continueBox, continueText, txStyle, CustomColor.dkgrey);
		Progress (screenCount);
	}
	
	function BackgroundBox (texture : Texture2D) {
		GUI.DrawTexture(backgroundBox, texture, ScaleMode.StretchToFill, false, 0);
	}
	
}

class GUIPlus {

	static function CenteredRect(x : int, y : int, w : float, h : float) : Rect {
		return Rect(x - (w / 2), y - (h / 2), w, h);
	}
	
	static function CreateTextureFromColor (col : Color) : Texture2D {
		var t : Texture2D;
		t = new Texture2D(1, 1);
		t.SetPixel(0, 0, col);
		t.wrapMode = TextureWrapMode.Repeat;
		t.Apply();
		return t;
	}
	
	static function LabelWithShadow (pos : Rect, text : String, style : GUIStyle, col : Color) {
	
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
	
}

function Start () {
	
	var player : GameObject = GameObject.FindGameObjectWithTag("Player");
	controller = player.GetComponent(CharacterController);
	input = player.GetComponent(FPSInputController);
	
	SetListeners ();
	if (Screen.width > 800)
		SetModelsPosition (-0.4);
	else
		SetModelsPosition (-0.35);
	
	var maxWidth : float = 1152.0;
	var ratio : float = Mathf.Lerp(0.0, 1.0, (Screen.width + 0.0) / maxWidth);
	titleStyle.fontSize *= ratio;
	textStyle.fontSize *= ratio;
	
	textures = new Textures ();
	textures.Start ();
	
	screenDimensions = new ScreenDimensions ();
	draw = new Draw (screenDimensions, titleStyle, textStyle);
	
	for (var i = 0; i < screenShown.Length; i ++) {
		screenShown[i] = false;
	}
	
}

function SetListeners () {
	
	Messenger.instance.Listen ("close_startscreen", this);
	Messenger.instance.Listen ("restart_game", this);
	Messenger.instance.Listen ("refill_air", this);
	Messenger.instance.Listen ("create_pipe", this);
	Messenger.instance.Listen ("end_pipe", this);
	Messenger.instance.Listen ("add_crystal", this);
	Messenger.instance.Listen ("player_fall", this);
	Messenger.instance.Listen ("get_air", this);
	Messenger.instance.Listen ("collect_crystal", this);
	Messenger.instance.Listen ("collect_pill", this);
	
}

function SetModelsPosition (percent : float) {
	models.transform.position.z = (cam.orthographicSize * 2) * percent;
}

function OnGUI () {
	
	if (!screenUp) 
		return;
	
	draw.BackgroundBox (textures.black);
	draw.Content (screen, screenCount);
	cam.Render ();
	
}

function Update () {

	if (!screenUp)
		return;
		
	if (Input.GetButtonDown("Jump")) {
		if (!okClose) 
			return;
			
		if (screen == TutorialScreen.Air) {
			screen = TutorialScreen.Discs;
			screenShown[parseInt(TutorialScreen.Discs)] = true;
			screenCount ++;
			models.GetComponent(TutorialModels).SetModel(parseInt(TutorialScreen.Discs));
			DelayCloseInput();
			return;
		} else if (screen == TutorialScreen.Bonuses) {
			CloseTutorial ();
			DelaySpinningScreen ();
		} else {
			CloseTutorial ();
		}
	}
}

function DelaySpinningScreen () {
	yield WaitForSeconds(0.75);
	new MessageWheelSpin ();
	ShowScreen(TutorialScreen.Spinning);
}

function ShowScreen (scr : TutorialScreen) {
	ShowScreen(parseInt(scr));
}

function ShowScreen (scr : int) {

	if (screenShown[scr] || !showTutorial)
		return;
			
	screen = scr;
	OpenTutorial ();
	screenCount = 0;
	for (var i = 0; i < screenShown.Length; i ++) {
		if (screenShown[i])
			screenCount ++;
	}
	screenShown[scr] = true;
	models.GetComponent(TutorialModels).SetModel(scr);
	DelayCloseInput();
	
}

function DelayCloseInput () {
	okClose = false;
	yield WaitForSeconds(0.5);
	okClose = true;
}

function OpenTutorial () {
	
	timeScale = TimeController.timeScale;
	TimeController.timeScale = 0.0;
	TimeController.instance.PauseCountDown();
	new MessageLerpTime ();
	new MessageChangeTime ();
	controller.enabled = false;
	screenUp = true;
	
	new MessageOpenTutorial ();
}

function CloseTutorial () {
	
	TimeController.timeScale = timeScale;
	TimeController.instance.ResumeCountDown();
	new MessageLerpTime ();
	new MessageChangeTime ();
	controller.enabled = true;
	screenUp = false;
	
	new MessageCloseTutorial ();
	
	// Disable the models at the end of the tutorial
	if (screenCount == screenShown.Length - 1) {
		models.gameObject.SetActive(false);
	}
}

function Activate () {
	gameObject.SetActive (true);
	for (var i = 0; i < screenShown.Length; i ++) {
		screenShown[i] = false;
	}
	new MessageWheelStop ();
}

function Deactivate () {
	new MessageWheelSpin ();
	gameObject.SetActive (false);
}

/* Messages */

function _CloseStartscreen () {
	showTutorial = true;
	yield WaitForSeconds(2.33);
	ShowScreen(0);
}

function _RestartGame () {
	for (var i : int = 0; i < screenShown.Length; i ++) {
		if (!screenShown[i])
			return;
	}
	showTutorial = false;
}

function _RefillAir () {
	ShowScreen (TutorialScreen.Air);
}

function _CreatePipe () {
	ShowScreen (TutorialScreen.Pipes);
}

function _EndPipe () {
	ShowScreen (TutorialScreen.Bonuses);
}

function _AddCrystal () {
	if (Inventory.instance.IsStomachFull()) {
		ShowScreen (TutorialScreen.Stomach);
	}
}

function _PlayerFall () {
	ShowScreen (TutorialScreen.Falls);
}

function _GetAir () {
	ShowScreen (TutorialScreen.GetAir);
}

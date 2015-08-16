#pragma strict
#pragma downcast

public var message : String;
public var style : GUIStyle;

private var screenDimensions : ScreenDimensions;
private var textures : NPCMessageTextures;
private var draw : NPCMessageDraw;

class NPCMessageTextures {

	@System.NonSerialized
	public var black : Texture2D;
	
	function Start () {
		var c : Color = CustomColor.black;
		c.a = 0.5;
		black = GUIPlus.CreateTextureFromColor(c);
	}

}

class NPCMessageDraw {
	
	private var sd : ScreenDimensions;
	private var style : GUIStyle;
	private var tx : NPCMessageTextures;
	
	private var color : Color;
	private var text : String;					// Full text to display
	private var textSub : String;				// "Typewriter" text- shows text character by character
	private var textDimensions : Vector2;		
	private var textRect : Rect;
	private var backRects : Array = new Array ();
	private var lineWidths : int[] = new int[20];
	private var maxWidth : int;
	private var lineHeight : int;
	
	private var counter : int = 0;
	
	function NPCMessageDraw (_sd : ScreenDimensions, _style : GUIStyle, _tx : NPCMessageTextures) {
		sd = _sd;
		style = _style;
		tx = _tx;
		maxWidth = sd.width - sd.left - (sd.border * 2);
		lineHeight = style.CalcHeight (new GUIContent ("Wy"), maxWidth);
		backRects.length = 1;
		backRects[0] = new Rect(0, 0, 0, 0);
		for (var i = 0; i < lineWidths.length; i ++) {
			lineWidths[i] = 0;
		}
	}
	
	function SetText (t : String) {
		text = t;
	}
	
	function SetColor (c : Color) {
		color = c;
	}
	
	function UpdateTextDimensions () {
		
		SetTextDimensions ();
		
		var lines = style.CalcHeight (new GUIContent (textSub), maxWidth) / lineHeight;
		backRects.length = lines;
		
		style.fixedWidth = 0;						
		var backDimensions : Vector2 = style.CalcSize (new GUIContent (textSub));
		lineWidths[lines] = backDimensions.x;
		var lineWidth : int = backDimensions.x;
		if (lines > 1) {
			lineWidth = (backDimensions.x - (lineWidths[lines - 1]) + 16);
		}
		
		backRects[lines] = new Rect (sd.left, 
									 sd.middle - (backDimensions.y / 2.0) + (lineHeight * (lines - 1)),
									 lineWidth, 
									 backDimensions.y);
									 
	}
	
	private function SetTextDimensions () {
		style.fixedWidth = maxWidth;
		textDimensions = style.CalcSize (new GUIContent (textSub));
		textRect = new Rect (sd.left, 
							 sd.middle - (textDimensions.y / 2.0),
							 textDimensions.x,
							 textDimensions.y);
	}
	
	function Text () {
		TextBackground ();
		GUIPlus.LabelWithShadow (textRect, textSub, style, color);
	}
	
	private function TextBackground () {
		var border : int = 16;
		for (var i = 0; i < backRects.length; i ++) {
			var rect : Rect = backRects[i];
			rect.x -= border;
			rect.width += (border * 2);
			rect.y -= border;
			rect.height += (border * 2);
			GUI.DrawTexture (rect, tx.black, ScaleMode.StretchToFill, false, 0);
		}
	}
	
	function ResetCounter () {
		counter = 0;
		textSub = text.Substring (0, counter);
		UpdateTextDimensions ();
	}
	
	function AddCounter () : boolean {
		var added : boolean = false;
		if (counter < text.Length) {
			counter ++;
			added = true;
		}
		textSub = text.Substring (0, counter);
		UpdateTextDimensions ();
		return added;
	}
}

private var screenUp : boolean = false;

function Start () {
	
	Messenger.instance.Listen ("open_startscreen", this);
	
	var maxWidth : float = 1152.0;
	var ratio : float = Mathf.Lerp(0.0, 1.0, (Screen.width + 0.0) / maxWidth);
	style.fontSize *= ratio;
	style.fontSize *= ratio;
	
	textures = new NPCMessageTextures ();
	textures.Start ();
	
	screenDimensions = new ScreenDimensions ();
	draw = new NPCMessageDraw (screenDimensions, style, textures);
	
}

function SetMessage (text : String, color : Color) {
	draw.SetText (text);
	draw.SetColor (color);
	screenUp = true;
	draw.ResetCounter ();
	AudioManager.PlayElement ("NPC", new PlaySettings (AudioManager.GetMetronome("Main"), SnapStyle.BeatValue, 0.25, true, 0f));
	CancelInvoke ("Count");
	InvokeRepeating ("Count", 0.1, 0.05);
}

function Count () {
	if (!draw.AddCounter ()) {
		AudioManager.StopElement ("NPC", new StopSettings (AudioManager.GetMetronome("Main"), 0.25));
	}
}

function CloseMessage () {
	screenUp = false;
}

function OnGUI () {
	if (!screenUp) return;
	draw.Text ();
}

function _OpenStartscreen () {
	screenUp = false;
}
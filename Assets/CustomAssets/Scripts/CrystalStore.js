#pragma strict

var title : GUIStyle;
var description : GUIStyle;

private var descriptionText = "Sell your crystals here and get MAD RICH! Spacebar sells. Escape leaves.";

private var titles = [ "Crystal", "Count", "Value", "Coins" ];
private var titleSep : int; // Spacial separation between words
private var firstSep : int; // the first separation is larger than the others
private var vSep : int;
private var content : String[,];
private var values = [ 10, 25, 50, 100, 250, 1000 ];
private var totalCoins : int;
private var totalCount : int;
private var LASTROW : int = 6;

private var input : FPSInputController;
private var motor : CharacterMotor;
private var controller : CharacterController;
private var screenUp : boolean = false;
private var player : Transform;

private var texBlack : Texture2D;
private var texYellow : Texture2D;

// Window values
private var width : int;
private var height : int;
private var center : int;
private var middle : int;
private var top : int;
private var bottom : int;
private var right : int;
private var border : int;

//private var titleTop : int;

private var backgroundBox : Rect;
private var dividerBox : Rect;

private var crystalCount : int = 6;
private var crystalMax : int = 3;
private var crystalsCollected : int = 0;
private var countingDown : boolean = false;
private var canOpen : boolean = true;			// We wait a couple seconds after leaving before allowing the screen to be opened again

private enum Column {
	crystal,
	count,
	val,
	coins
}

function Start () {

	//renderer.materials[0].color = CustomColor.black;
	//renderer.materials[1].color = CustomColor.green;
	var c : Color[] = [ CustomColor.black, CustomColor.green ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
	
	content = new String[4, 7];
	content[0, 0] = "Violet";
	content[0, 1] = "Blue";
	content[0, 2] = "Green";
	content[0, 3] = "Yellow";
	content[0, 4] = "Orange";
	content[0, 5] = "White";
	
	for (var i = 0; i < 6; i ++) {
		content[2, i] = values[i].ToString();
	}
	
	content[0, 6] = "Total";		// Unchanging
	content[1, 6] = "";				// Crystal count
	content[2, 6] = "";				// Blank
	content[3, 6] = "";				// Total value
	
	width = Screen.width;
	height = Screen.height;
	center = width / 2;
	middle = height / 2;
	
	var backgroundSize : float = 0.825;
	top = middle - ((height * backgroundSize) / 2);
	bottom = middle + ((height * backgroundSize) / 2);
	right = center - ((width * backgroundSize) / 2);
	border = (((height * backgroundSize) / 10) + ((width * backgroundSize) / 10)) / 2;
	backgroundBox = CenteredRect(center, middle, width * backgroundSize, height * backgroundSize);
	
	dividerBox = CenteredRect(center, 0, (width * backgroundSize) - (border * 2), 2);
	
	titleSep = ((width * backgroundSize) - border) / (titles.Length);
	firstSep = 0;
	vSep = height / 12;
	//firstSep = titleSep * 0.67;
	//titleSep = titleSep * 0.33;
	
	// Resize the text to fix the window size
	/*var descTextWidth : int = description.CalcSize(new GUIContent(descriptionText)).x;
	while (descTextWidth > ((width * backgroundSize) - (border * 2))) {
		description.fontSize --;
		descTextWidth = description.CalcSize(new GUIContent(descriptionText)).x;
	}*/
	
	var maxWidth : float = 1152.0;
	var ratio : float = Mathf.Lerp(0.0, 1.0, (Screen.width + 0.0) / (maxWidth));
	description.fontSize *= ratio;
	title.fontSize *= ratio;
	
	player = GameObject.Find("Player").transform;
	input = player.GetComponent(FPSInputController);
	motor = player.GetComponent(CharacterMotor);
	controller = player.GetComponent(CharacterController);
	
	Messenger.instance.Listen("update_inventory", this);
	Messenger.instance.Listen("restart_game", this);
	Messenger.instance.Listen("add_crystal", this);
	
	texBlack = CreateTextureFromColor(CustomColor.black);
	texYellow = CreateTextureFromColor(CustomColor.yellow);
	
	crystalMax = Inventory.instance.GetItemValue(Item.stomach);
	
}

function CreateTextureFromColor (col : Color) : Texture2D {
	var t : Texture2D;
	t = new Texture2D(1, 1);
	t.SetPixel(0, 0, col);
	t.wrapMode = TextureWrapMode.Repeat;
	t.Apply();
	return t;
}

function CenteredRect(x : int, y : int, w : float, h : float) {
	return Rect(x - (w / 2), y - (h / 2), w, h);
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Net") {
		OpenScreen();
	}
}

function Update () {

	if (!screenUp)
		return;
		
	//if (screenUp) {
		if (Input.GetKeyDown(KeyCode.Escape)) {
			CloseScreen();
		}
		if (Input.GetButtonDown("MenuClose")) {
			CloseScreen();
		}
		if (Input.GetButtonDown("Jump") || Input.GetKeyDown (KeyCode.Return)) {
			Sell();
		}
	//}
}

function Sell () {
	AudioManager.PlayElement("Sell", new PlaySettings (AudioManager.GetMetronome("Main"), 0.25));
	StartCoroutine(CountDown());
	new MessageEmptyStomach();
	yield WaitForFixedUpdate();
}

/*function CountDown () {
	
	if (crystalsCollected == 0)	
		return;
	
	countingDown = true;
	
	for (var i = 0; i < crystalCount; i ++) {
		yield CountDownCrystal (i);
	}
	
	for (i = 0; i < crystalCount; i ++) {
		Inventory.instance.crystals[i + 1] = 0;
		SetTotals(i, 0, 0);
	}
	
	crystalsCollected = 0;
	countingDown = false;
}

function CountDownCrystal (i : int) {

	var time : float = 1.5;
	var eTime : float = 0.0;
	var startCount : int = Inventory.instance.crystals[i + 1];
	if (startCount == 0)
		return;
		
	var startCoins : int = startCount * values[i];
	var count : int = startCount;
	var coins : int = startCoins;
	var startTotalCount : int = totalCount;
	var startTotalCoins : int = totalCoins;
	var startScore : int = Score.coinCount - 1;
	var endScore : int = (startScore + totalCoins);

	while (eTime < time) {
		eTime += Time.deltaTime;
		var percent : float = eTime / time;
		
		count = Mathf.Lerp(startCount, 0, percent);
		coins = Mathf.Lerp(startCoins, 0, percent);
		SetTotals(i, count, coins);
		
		totalCount = Mathf.Lerp(startTotalCount, 0, percent);
		totalCoins = Mathf.Lerp(startTotalCoins, 0, percent);
		SetTotals(6, totalCount, totalCoins);
		
		Score.coinCount = Mathf.Lerp(startScore, endScore, percent);
		new MessageUpdateScore ();
		
		yield;
	}
}*/

function CountDown () {

	if (crystalsCollected == 0)
		return;
	
	countingDown = true;
	
	var time : float = 1.0;
	var elapsedTime : float = 0.0;
	
	var startScore : int = Score.coinCount - 1;
	var endScore : int = (startScore + totalCoins);
	
	var startTotalCount : int = totalCount;
	var startTotalCoins : int = totalCoins;
	
	var startCount : int[] = new int[crystalCount];
	var startCoins : int[] = new int[crystalCount];
	var count : int[] = new int[crystalCount];
	var coins : int[] = new int[crystalCount];
	
	for (var i = 0; i < crystalCount; i ++) {
		startCount[i] = Inventory.instance.crystals[i + 1];
		startCoins[i] = startCount[i] * values[i];
		count[i] = startCount[i];
		coins[i] = startCoins[i];
	}
	
	//AudioManager.PlayElement ("Tick", new PlaySettings (AudioManager.GetMetronome("Main"), 0.125));
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		var percent : float = elapsedTime / time;
		
		for (var j = 0; j < crystalCount; j ++) {
			if (startCoins[j] > 0) {
				count[j] = Mathf.Lerp(startCount[j], 0, percent);
				coins[j] = Mathf.Lerp(startCoins[j], 0, percent);
				SetTotals(j, count[j], coins[j]);
			}
		}
		
		totalCount = Mathf.Lerp(startTotalCount, 0, percent);
		totalCoins = Mathf.Lerp(startTotalCoins, 0, percent);
		
		SetTotals(6, totalCount, totalCoins);
		Score.coinCount = Mathf.Lerp(startScore, endScore, percent);
		
		/*if (elapsedTime % 0.15 < 0.01) {
			AudioMessageListener.instance._CollectCoin ();
		}*/
		
		new MessageUpdateScore();
		yield;
	}
	AudioMessageListener.instance._CollectCoin ();
	
	for (var k = 0; k < crystalCount; k ++) {
		Inventory.instance.crystals[k + 1] = 0;
		SetTotals(k, 0, 0);
	}
	
	crystalsCollected = 0;
	countingDown = false;
	
}

function SetTotals (pos : int, count : int, coins : int) {
	content[Column.count, pos] = count.ToString();
	content[Column.coins, pos] = coins.ToString();
	if (pos == LASTROW) {
		 content[Column.count, pos] = count.ToString() + " / " + crystalMax.ToString();
	}
}

function OnGUI () {
	if (screenUp) {
		
		// Background
		GUI.DrawTexture(backgroundBox, texBlack, ScaleMode.StretchToFill, false, 0);
		
		DrawDivider(top + border + (title.fontSize * 1.5));
		DrawDivider(top + border + (6 * vSep) + (title.fontSize * 1.5));
		
		LabelWithShadow(Rect(center, top + (border / 2), 0, 0), descriptionText, description, CustomColor.grey);		// "welcome to the store" text
		
		LabelWithShadow(Rect(right + border + (titleSep * 1.6), top + border, 0, 0), "x", title, CustomColor.yellow);
		LabelWithShadow(Rect(right + border + (titleSep * 2.6), top + border, 0, 0), "=", title, CustomColor.yellow);
		
		for (var i = 0; i < titles.Length; i ++) {
			var position = new Rect(right + border + (titleSep * i), top + border, 0, 0);
			LabelWithShadow(position, titles[i], title, CustomColor.yellow);
			
			var crystals : int = 0; // We only add vertical spacing if at least one of a type of crystal has been collected
			
			for (var j = 0; j < crystalCount + 1; j ++) {
				
				if (content[Column.count, j] != "0") {
					crystals ++;
				}
				
				var c : Color = CustomColor.yellow;
				position.y = (top + border) + (crystals * vSep);
				
				// Color the names of the crystals with their corresponding colors
				if (j < crystalCount) {
					c = CustomColor.colorProgression[j + 1];
				}
				
				// Only show the information if more than one crystal has been collected
				if (content[Column.count, j] != "0" && j < crystalCount) {
					LabelWithShadow(position, content[i, j], title, c);
				}
				
				// The final row (always stays at the bottom)
				if (j == crystalCount) {
					position.y = (top + border) + ((crystalCount + 1) * vSep);
					LabelWithShadow(position, content[i, j], title, c);
				}
			}
		}
	}
}

function DrawDivider (y : int) {
	dividerBox.y = y;	
	GUI.DrawTexture(dividerBox, texYellow, ScaleMode.StretchToFill, false, 0);
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

function OpenScreen () {
	if (canOpen) {
		UpdateScreen();
		input.stop = true;
		yield WaitForStop();
		input.enabled = false;
		screenUp = true;
		motor.enabled = false;
		new MessageOpenScreen();
	} 
}

function CloseScreen () {
	while (countingDown) {
		yield;
	}
	motor.enabled = true;
	input.enabled = true;
	input.stop = false;
	screenUp = false;
	new MessageCloseScreen();
	canOpen = false;
	yield WaitForSeconds(0.5);
	canOpen = true;
}

function UpdateScreen () {

	totalCoins = 0;
	totalCount = 0;
	for (var i = 1; i < crystalCount + 1; i ++) { 
		var count : int = Inventory.instance.crystals[i];
		var coins : int = count * values[i - 1];
		SetTotals(i - 1, count, coins);
		totalCoins += coins;
		totalCount += count;
	}
	
	SetTotals(6, totalCount, totalCoins);

}

function WaitForStop () {
	while (controller.velocity != Vector3.zero) {
		yield;
	}
}

function GetPlayerVelocity () {
	return (player.GetComponent(CharacterController).velocity.y);
}

function _RestartGame () {
	yield WaitForFixedUpdate();
	UpdateScreen();
	CloseScreen();
}

function _UpdateInventory () {
	crystalMax = Inventory.instance.GetItemValue(Item.stomach);
	crystalsCollected = Inventory.instance.GetCrystalCount();
}

function _AddCrystal () {
	crystalsCollected = Inventory.instance.GetCrystalCount();
}

function _EmptyStomach () {
	crystalsCollected = 0;
}
#pragma strict
#pragma downcast

private var dirty : boolean = false;		// Has the state of the platform changed since the last save?
private var whiteOnly : boolean = false;
private var shrink : boolean = false;
private var platBody : PlatformBody;

@HideInInspector
var center : Transform;						// Point the platform rotates around
@HideInInspector
var direction : Vector3;					// Which way to rotate around the center

@HideInInspector
var speed : float = 7.0;					// Speed at which the platform rotates, set by Wheel

@HideInInspector
var timeScale : float = 1.0;				// TimeController's timeScale

// Objects created on the platform
private enum Rider {						// Objects which might "ride" with this platform	
	button,
	pipe,
	coin,
	pill,
	dummy,
	body,
	bodyHole,
	bodyTrampoline,
	bodySmall,
	bodyLarge,
	bodyMissing,
	bodyShrinking,
	transporter,
	crystal,
	outlineEffect,
	donut,
	buttonDummy,
	nonStatic
}

var coinSound : AudioClip;

var riderObjects : GameObject[];			// Array of game objects that matches the Rider enum
private var riders : GameObject[,];			// Objects attached to this platform
private var objAmount : int = 20;			// Maximum amount possible of each object
private var riderAmount : int;

var coinBonus : GameObject;					// The coin bonus does not actually stay on the platform, so it is not part of the riders array
var reversePlatform : GameObject;			// A platform moving in the opposite direction

private var bodyType : Rider;					// The type of body this platform has (small, large, or hole)
var shadow : GameObject;					
private var myShadow : GameObject; 			// The shadow is not actually a child, it just follows the platform

// Variables unique to this platform
public var myTransform : Transform;

@HideInInspector
var wheel : int;							// Which wheel this platform is a part of
private var nearestCenter : boolean = true;// Is the player currently playing on our wheel?
private var updateNearestCenter : boolean = true;

@HideInInspector
var row : int;

@HideInInspector
var column : int = -1;						// Only platforms with the ability to pipe will have a + value for column

@HideInInspector
var index : int;							// This platform's unique identifier within this row

@HideInInspector
var type : int;								// "Type" indicates the platform's color and what kind of bonus it gives

@HideInInspector
var myColor : Color;						// Primary Color passed on to PlatformBody

@HideInInspector
var myColorSecondary : Color;				// Secondary platform color, also passed on to PlatformBody

@HideInInspector
var myColorOutline : Color;					// Outline color passed on to PlatformBody

private var inView : boolean = false;		// If platform can be seen by camera
private var canPipe : boolean = false;		// If platform can generate a pipe

@HideInInspector
var doublePipe : boolean = false; 			// There are two types of pipes: single and double. Double goes up two rows.
private var noButton : boolean = false;		// Platforms that can pipe on the topmost row do not have a button initially
@HideInInspector
var buttonBottomed : boolean = false;

// Variables for objects created on this platform
@HideInInspector
var buttonScale : float = 0.75;

@HideInInspector
var hasPlatform : boolean = true;

@HideInInspector
var hasPipe : boolean = false;

//@HideInInspector
//var fullPipe : boolean = false;				// Does a pipe stretch from bottom row to top row?

@HideInInspector
var pipeColor : Color = CustomColor.yellow;

@HideInInspector
var hasPill : boolean = false;

@HideInInspector
var hasCrystal : boolean = false;

//@HideInInspector
var hasDonut : boolean = false;
private var donutType : int = 0;
private var myDonut : GameObject;

@HideInInspector
var bonusType : int;

//@HideInInspector
var isNearest : boolean = false;

@HideInInspector
var interval : int = -1;			// If this is a piping platform and it is in a pipe only row, it will only be activated if its interval has been activated (i.e., a donut was created and now new rows are appended to the column)
private var maxInterval : int = 5;	// After a donut has been created in this column, the max interval gets set so that platforms are not created above it

private var childColliders : Collider[] = new Collider[25];

// Coins
private var coinPositions : Vector3[] = new Vector3[objAmount];				// When new coins are created they are put in positions determined by this array
private var coins : Vector3[];												// Position references to the coins on this platform
//@System.NonSerialized
var coinCount : int = 0;													// Total number of coins created on this platform
//@HideInInspector
var coinMax : int = 4;														// Maximum number of coins this platform can create
private var EMPTY_COIN_SLOT : Vector3 = Vector3(100.0, 100.0, 100.0);

function Awake () {	
	
	riderAmount = System.Enum.GetValues(Rider).Length;
	riders = new GameObject[riderAmount, objAmount];
	coins = new Vector3[objAmount];
	for (var i = 0; i < objAmount; i ++) {
		coins[i] = EMPTY_COIN_SLOT;
	}
	
	myTransform = transform;
	buttonScale = 0.75;
	coinMax = 4;	

}

function Start () {	

	Messenger.instance.Listen("press_button", this);
	Messenger.instance.Listen("bottomed_button", this);
	Messenger.instance.Listen("restart_game", this);
	Messenger.instance.Listen("close_startscreen", this);
	Messenger.instance.Listen("save_game", this);
	Messenger.instance.Listen("load_game", this);
	
	Create ();
	
}

function Create () {
	if (row <= 18)
		gameObject.layer = row + 10;
	else
		gameObject.layer = (row - 18) + 10;
	
	canPipe = CanPipe();
	doublePipe = SetDoublePipe();
	column = SetColumn();
	type = SetType();
	
	bodyType = SetBodyType();
	
	if (bodyType == Rider.bodyMissing)
		return;
	
	/*if (type % 2 == 0 && column == -1) {
		if (bodyType == Rider.body || bodyType == Rider.bodyLarge || bodyType == Rider.bodySmall) {
			GameController.instance.platformTypes[(type / 2) - 1] ++;
			
			var vals = [ 10, 25, 50, 100, 250, 1000, 0, 0 ];
			var val = vals[(type / 2) - 1];
			GameController.instance.rowValues[row] += val;
		}
	}*/
	
	SetColor();
	bonusType = SetBonusType();
	coinMax = SetCoinMax();
	
	// Determine positions of coins to be created
	SetCoinPositions();
	
	SetNoButton ();

	pipeColor = CustomColor.yellow;
	
	direction = Vector3.Scale(Vector3(Wheel.direction, Wheel.direction, Wheel.direction), center.transform.eulerAngles);
	
	BuildPlatform();
	DeactivateRenderers();
}

function SetWhiteOnly (b : boolean) {
	whiteOnly = b;
	SetColor ();
	if (platBody.active) {
		platBody.UpdateColor ();
	}
}

function SetShrink (b : boolean) {
	shrink = true;
	platBody.shrinker = true;
}

function SetNoButton () {
	if (bodyType == Rider.bodyHole || bodyType == Rider.bodyTrampoline) {
		noButton = true;
	}
}

function CanPipe () { 

	var i : int = index + 1;
	var r : int = row + 1;
	
	if (row < 5) {
		
		// Create single pipes
		return (i % r == 1 || row == 0);
	} else {
	
		// Create single and double pipes
		return (i % r == 1 || SetDoublePipe());
	}
}

function SetDoublePipe () {

	var i : int = index + 1;
	var r : int = row + 1;
	return (i % r == (r / 2) + 1 && r % 4 == 0 && row < Wheel.rows - (Wheel.pipeOnlyRows + 1)); 
	//return (i % r == (r / 2) + 1 && r % 2 == 0); //uncomment to have double pipes appear on lower rows
	
}

function SetType () {
	if (canPipe) {
		return 0;
	} else {	
		
		var rare : int = Random.Range(0, 100);
		if (row > 5) { 
		
			// Black platforms to avoid
			if (row > 10) { 
				if (rare == 14 || rare == 15 || rare == 16 || rare == 17) {
					if (rare > 15) {
						rare -= 2;
					}
					return rare;
				}
			}
			
			// White platforms with the best bonuses
			if (rare == 12 || rare == 13) {
				return rare;
			} else {
				
				// Regular platforms (above row 5)
				var high : int = Mathf.CeilToInt(row / 2) * 2;
				high = Mathf.Min(high, 9);
				var low : int = Mathf.RoundToInt(high / 2);
				return SkewedRandomRange(2 + low, 2 + high, 1.0);
			}
		} else {
		
			// Regular platforms
			high = Mathf.CeilToInt(row / 2) * 2;
			high = Mathf.Min(high, 9);
			low = Mathf.RoundToInt(high / 2);
			return SkewedRandomRange(2 + low, 2 + high, 1.0);
		}
	}
}

function SetBonusType () {
	if (!canPipe) {
		return Mathf.FloorToInt(type / 2);
	}
	return -1;
}

function SetColumn () {
	if (canPipe) {
		if (row == 0) {
			return ((index + 1) / (row + 1)) - 1;
		} else {
			return (index + 1) / (row + 1);
		}
	}
	return -1;
}

function SetColor () {
	myColor = CustomColor.colorProgression[Mathf.Floor(type / 2) + wheel];
	
	// White mode
	if (whiteOnly) {
		myColor = CustomColor.white;
		myColorSecondary = CustomColor.white;
		myColorOutline = CustomColor.black;
		return;
	}
	
	if (canPipe) {
		
		// Pipe platform
		myColorSecondary = myColor;
		myColorOutline = CustomColor.black;
		
	} else {
		if (bodyType == Rider.bodyTrampoline || bodyType == Rider.bodyHole) {
			
			// Trampolines and holes do not produce bonuses, so they are grey
			myColor = CustomColor.dkgrey;
			myColorSecondary = CustomColor.grey;
			myColorOutline = CustomColor.black;
			
		} else {
			if (type % 2 == 0) {
				
				// Crystal platforms
				myColorSecondary = myColor + CustomColor.dkgrey; //myColor + CustomColor.black;
				myColorOutline = CustomColor.black;
				
				
			} else {
				
				// Pill platforms
				myColorSecondary = CustomColor.black; 
				myColorOutline = CustomColor.black; 
				
			}
		}
	}
}

function SetColorSpecial () {
	if (type == 0)
		return CustomColor.colorProgression[type];
	else
		return CustomColor.black;
}

function SetCoinMax () {
	if (bodyType == Rider.bodySmall) {
		return 4;
	}
	return Mathf.Min(17, Mathf.Ceil((row + 1.0) / 2.0) * 2);
}

function SetBodyType () {
	
	// Piping platforms get normal bodies
	if (column == -1) {
		
		// first 3 rows are normal
		var min : int = 2;
		if (row > min) {
			
			// introduce more varied types as we go up
			var high : int = Mathf.Floor((row - min) / 2) * 2;
			var b : int = SkewedRandomRange(Rider.body, Rider.body + high, 1.5);
			
			// cap it at 10 (no more bodies above this)
			if (b > 10) 
				b = 10;
			
			// normal bodies decrease slowly in prevalence 
			var normal : float = Random.Range(1, 10);
			if (normal < (((Wheel.rows - row) / Wheel.rows) + 0.5) * 10.0) {
				
				// platforms located above double pipes should be limited to normal, large, and small bodies	
				var i : int = index + 1;
				var r : int = row + 1;
	
				if (i % r == (r / 2) + 1 && r % 2 == 0 && row < Wheel.rows - 6) {
					if (b == Rider.body || b == Rider.bodyLarge || b == Rider.bodySmall) {
						return b;
					} else {
						
						// if it is not normal, large, or small, set it to normal
						return Rider.body;
					}
				}
				
				// potentially non-normal body
				return b;
			} else {
				
				// normal body
				return Rider.body;
			}
		}
	}
	
	// Piping platforms in pipe only rows get the special non-static platform body
	if (row > Wheel.rows - Wheel.pipeOnlyRows) {
		return Rider.nonStatic;
	}
	
	return Rider.body;
}

function SkewedRandomRange(start: int, end: int, p: float) : float {
    return Mathf.RoundToInt(Mathf.Pow(Random.value, p) * ((end + 0.0) - (start + 0.0)) + (start + 0.0));
}

function SetCoinPositions () {

	var big : float = 0.0;
	if (bodyType == Rider.bodyLarge) {
		big = 1.0;
	}
	
	var offset : int = Mathf.RoundToInt(Random.Range(0, 3));
	var a : int = 0;
	if (offset == 1) {
		a = 90;
	}
	
	// First 4
	AddCoinPositions(2, 3.5 + big, 0, 0 + a);
	AddCoinPositions(2, 3.5 + big, 2, 90 + a);
	
	// Next 6
	AddCoinPositions(2, 4.5 + big, 4, 0 + a);
	AddCoinPositions(2, 4.5 + big, 6, 60 + a);
	AddCoinPositions(2, 4.5 + big, 8, 120 + a);
	
	// Last 8
	AddCoinPositions(2, 5.5 + big, 10, 0 + a);
	AddCoinPositions(2, 5.5 + big, 14, 90 + a);
	AddCoinPositions(2, 5.5 + big, 12, 45 + a);
	AddCoinPositions(2, 5.5 + big, 16, 135 + a);
}

function AddCoinPositions(amt : int, dis : float, off : int, angleOffset : float) {
	var y = 2.0;
	for (var i = 0; i < amt; i ++) {
		var a = 360 / amt;
		var x = dis * Mathf.Cos(((i * a) + angleOffset) * Mathf.Deg2Rad);
		var z = dis * Mathf.Sin(((i * a) + angleOffset) * Mathf.Deg2Rad);
		coinPositions[i + off] = Vector3(x, y, z);
	}
}

function IsIntervalActive () {
	if (column == -1)
		return true;
	return (interval <= Wheel.activeInterval && interval <= Wheel.maxInterval[column]);
}

function OnViewEnter () {

	if (bodyType == Rider.bodyMissing || !IsIntervalActive())
		return;
		
	ActivatePlatformObjects();
	ActivateRenderers();
	CreateShadow();
}

function OnViewExit () {

	if (bodyType == Rider.bodyMissing || !IsIntervalActive())
		return;
		
	DeactivatePlatformObjects();
	DeactivateRenderers();
	DestroyShadow();
}

// ----------------------------------------- // Creating & Destroying Objects // ----------------------------------------- //

function BuildPlatform () {
	if (bodyType != Rider.bodyMissing) {
		platBody = CreateObjectOnPlatform(bodyType).GetComponent (PlatformBody);
		if (shrink)
			platBody.shrinker = true;
		else 
			platBody.shrinker = false;
	}
}

function CreateObjectOnPlatform (obj : int) {
	return CreateObjectOnPlatform (obj, true);
}

function CreateObjectOnPlatform (obj : int, allowMultiple : boolean) {
	
	// Creates an object at origin
	for (var i = 0; i < objAmount; i ++) {
		if (!allowMultiple && riders[obj, i] != null) {
			return riders[obj, i];
		}
		if (riders[obj, i] == null) {
			riders[obj, i] = ObjectBase.instance.Instantiate(riderObjects[obj], myTransform.position);
			riders[obj, i].transform.parent = myTransform;
			riders[obj, i].transform.rotation = myTransform.rotation;
			riders[obj, i].gameObject.layer = gameObject.layer;		
			return riders[obj, i];	
		}
	}
	
	return null;
}

function CreateObjectOnPlatform (obj : int, pos : Vector3) {
	
	// Creates an object at a position relative to the origin
	var X = pos.x;
	var Y = pos.y;
	var Z = pos.z;
		
	for (var i = 0; i < objAmount; i ++) {
		if (riders[obj, i] == null) {
			var p : Vector3 = myTransform.position;
			
			// Reverse if we are on the underside
			var sign : float = 1.0;
			if (p.y < center.position.y)
				sign = -1.0;
			
			var anglePlatformRotation = myTransform.eulerAngles.x * Mathf.Deg2Rad;
			var y2 : float = (-1 * Mathf.Sin(anglePlatformRotation) * Z) + p.y + (Y * sign);
			var z2 : float = (Mathf.Cos(anglePlatformRotation) * Z * sign) + p.z + (Mathf.Sin(anglePlatformRotation) * Y);
			
			riders[obj, i] = ObjectBase.instance.Instantiate(riderObjects[obj], Vector3(p.x + X, y2, z2));
			riders[obj, i].transform.parent = myTransform;
			riders[obj, i].transform.rotation = myTransform.rotation;
			riders[obj, i].gameObject.layer = gameObject.layer;
			
			return riders[obj, i];			
		}
	}
	
	return null;
}

function CreateObjectOnPlatform (obj : int, pos : Vector3, i : int) {
	
	// Creates an object at a position relative to the origin, and at the specified spot in the array
	var X = pos.x;
	var Y = pos.y;
	var Z = pos.z;
	
	if (riders[obj, i] == null) {
		var p : Vector3 = myTransform.position;
		
		// Reverse if we are on the underside
		var sign : float = 1.0;
		if (p.y < center.position.y)
			sign = -1.0;
		
		// Platform's rotation in radians
		var anglePlatformRotation = myTransform.eulerAngles.x * Mathf.Deg2Rad;
		
		var x2 : float;
		var y2 : float;
		var z2 : float;
		if (myTransform.eulerAngles.normalized == Vector3.right) {
			x2 = p.x + X; 
			y2 = (-1 * Mathf.Sin(anglePlatformRotation) * Z) + p.y + (Y * sign);
			z2 = (Mathf.Cos(anglePlatformRotation) * Z * sign) + p.z + (Mathf.Sin(anglePlatformRotation) * Y);
		} 
		
		riders[obj, i] = ObjectBase.instance.Instantiate(riderObjects[obj], Vector3(x2, y2, z2));
		riders[obj, i].transform.parent = myTransform;
		riders[obj, i].transform.rotation = myTransform.rotation;
		riders[obj, i].gameObject.layer = gameObject.layer;
		
		return riders[obj, i];			
	}
	
	return null;
}

function DestroyObjectOnPlatform (obj : int) {
	
	// Destroys an object
	if (riders[obj, 0] != null) {
		riders[obj, 0].transform.parent = null;
		ObjectBase.instance.Destroy(riders[obj, 0]);
		riders[obj, 0] = null;
	}
}

function DestroyObjectOnPlatform (obj : int, i : int) {
	
	// Destroys the object at position i in the array
	if (riders[obj, i] != null) {
		riders[obj, i].transform.parent = null;
		ObjectBase.instance.Destroy(riders[obj, i]);
		riders[obj, i] = null;
	}
}

function GetObjectOnPlatform (obj : int) {
	return riders[obj, 0];
}

// ----------------------------------------- // Activating & Deactivating Platform // ----------------------------------------- //

function ActivatePlatformObjects () {
	if (!inView && hasPlatform && bodyType != Rider.bodyMissing && bodyType != Rider.bodyHole && bodyType != Rider.bodyTrampoline) {
		if (hasPipe && !doublePipe)
			CreateObjectOnPlatform(Rider.pipe);
		if (hasPill)
			CreateObjectOnPlatform(Rider.pill, Vector3(0.0, 1.5, 0.0));
		if (hasCrystal)
			CreateObjectOnPlatform(Rider.crystal, Vector3(0.0, 2.5, 0.0));
		if (!noButton)
			CreateObjectOnPlatform(Rider.buttonDummy, false).GetComponent(ButtonDummy).Init(this);
		
		DeactivateColliders();
		inView = true;
	}
}

function DeactivatePlatformObjects () {
	if (inView && hasPlatform && bodyType != Rider.bodyMissing && bodyType != Rider.bodyHole && bodyType != Rider.bodyTrampoline) {
		if (hasPipe && !doublePipe) 
			DestroyObjectOnPlatform(Rider.pipe);
		if (hasPill)
			DestroyObjectOnPlatform(Rider.pill);
		if (hasCrystal) 
			DestroyObjectOnPlatform(Rider.crystal);
		if (!noButton)
			DestroyObjectOnPlatform(Rider.buttonDummy);
		inView = false;
	}
}

function MakeNearest () {
	
	isNearest = true;
	if (bodyType == Rider.bodyMissing || !IsIntervalActive ())
		return;
	
	if (!noButton) {
		CreateObjectOnPlatform(Rider.button, false).GetComponent(Button).Init(this);
		DestroyObjectOnPlatform (Rider.buttonDummy);
	}
	ActivateColliders();
}

function UnmakeNearest () {

	isNearest = false;
	if (bodyType == Rider.bodyMissing || !IsIntervalActive ())
		return;
		
	if (!noButton) {
		CreateObjectOnPlatform (Rider.buttonDummy, false).GetComponent (ButtonDummy).Init (this);
		DestroyObjectOnPlatform (Rider.button);
	}
	DeactivateColliders();
}

function ActivateColliders () {
	var colliders = GetComponentsInChildren(Collider);
	for (var c : Collider in colliders) {
		c.enabled = true;
	}
}

function DeactivateColliders () {
	var colliders = GetComponentsInChildren(Collider);
	for (var c : Collider in colliders) {
		//if (c.tag != "Coin")
			c.enabled = false;
	}
}

function ActivateRenderers () {
	var renderers = GetComponentsInChildren(Renderer);
	for (var r : Renderer in renderers) {
		if (r.tag == "Body" /*|| r.tag == "Button" || r.tag == "OutlineEffect"*/ || r.tag == "Coin") {
			r.enabled = true;
			if (bodyType == Rider.bodyTrampoline && r.tag == "Body") {
				r.transform.GetChild(0).renderer.enabled = true;
			}
		}
	}
}

function DeactivateRenderers () {
	var renderers = GetComponentsInChildren(Renderer);
	for (var r : Renderer in renderers) {
		if (r.tag == "Body" /*|| r.tag == "Button" || r.tag == "OutlineEffect"*/ || r.tag == "Coin") {
			r.enabled = false;
			if (bodyType == Rider.bodyTrampoline && r.tag == "Body") {
				r.transform.GetChild(0).renderer.enabled = false;
			}
		}
	}
}

// ----------------------------------------- // Coins // ----------------------------------------- //

function HasCoins () {
	for (var i = 0; i < objAmount; i ++) {
		if (coins[i] != EMPTY_COIN_SLOT) {
			break;
		}
		if (i == objAmount - 1) {
			return false;
		}
	}
	return true;
}

function CreateCoin () {
	if (coinCount > coinMax)
		return;
	var pos : Vector3 = coinPositions[coinCount];
	var val : int = AddCoinToArray(pos);
	var o : GameObject = CreateObjectOnPlatform(Rider.coin, pos, val);
	o.GetComponent(Coin).startPosition = pos;
	coinCount ++;
	// Limit it to 4 so that the sound doesn't become overwhelming
	if (coinCount < 4) new MessageCreateCoin();
}

function AddCoinToArray (pos : Vector3) {
	for (var i = 0; i < objAmount; i ++) {
		if (coins[i] == EMPTY_COIN_SLOT) {
			coins[i] = pos;		
			return i;
		}
	}
	Debug.LogError("Coin could not be added to array!");
	return -1;
}

function RemoveCoinFromArray (pos : Vector3) : int {
	for (var i = 0; i < objAmount; i ++) {
		if (coins[i] == pos && coins[i] != EMPTY_COIN_SLOT) {
			coins[i] = EMPTY_COIN_SLOT;
			if (coinCount > 0)
				coinCount --;
			return i;
		}
	}
	return -1;
}

function DestroyCoin (pos : Vector3) {
	
	// Destroys the coin at the given position and creates a pipe if it was the last one
	var i : int = RemoveCoinFromArray(pos);
	DestroyObjectOnPlatform(Rider.coin, i);
	if (AllCoinsCollected()) {
		CreateBonus();
	}
	SetDirty ();
}

function DestroyAllCoins () {
	for (var i = 0; i < objAmount; i ++) {
		if (coins[i] != EMPTY_COIN_SLOT)
			DestroyObjectOnPlatform(Rider.coin, i);
	}
}

function DestroyPlatform () {
	if (inView && column == -1) {
	
		DestroyAllCoins();
	
		var animationLength : float = animation["PlatformShrink"].clip.length;
		
		animation.Play("PlatformShrink");
		yield WaitForSeconds(animationLength);
		animation.Stop();
		
		//DestroyObjectOnPlatform(Rider.button);
		DestroyObjectOnPlatform(bodyType);
		DestroyObjectOnPlatform(Rider.outlineEffect);
		hasPlatform = false;
		if (hasPill) {
			DestroyPill();
		}
		if (hasCrystal) {
			DestroyCrystal();
		}
		if (hasDonut) {
			DestroyDonut();
		}
		if (hasPipe) {
			DestroyPipe();
		}
	}
}

/*function Shrink (time : float) {
	var elapsedTime : float = 0.0;
	var startScale : Vector3 = myTransform.localScale;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		myTransform.localScale = Vector3.Lerp(startScale, Vector3.zero, (elapsedTime / time));
		yield;
	}	
}*/

function DestroyPill () {
	hasPill = false;
	DestroyObjectOnPlatform(Rider.pill);
}

function DestroyCrystal () {
	hasCrystal = false;
	DestroyObjectOnPlatform(Rider.crystal);
}

function DestroyDonut () {
	hasDonut = false;
	DestroyObjectOnPlatform(Rider.donut);
}

function DestroyPipe () {
	hasPipe = false;
	DestroyObjectOnPlatform(Rider.pipe);
}

function CreateBonus () {
	if (canPipe) {
		if (row == (Wheel.rows - Wheel.pipeOnlyRows) + ((Wheel.activeInterval + 1) * (Wheel.pipeOnlyRows / 6.0))) { 
			Wheel.maxInterval[column] = Wheel.activeInterval;
			CreateDonut();
		} else {
			CreatePipe();
		}
	} else {
		if (type % 2 == 0) {
			CreateCrystal();
			new MessageCreateCrystal ();
		} else {
			CreatePill();
			new MessageCreatePill ();
		}
	}
}

function CreateOutlineEffect () {
	var total : int = (row + 1) * Wheel.columns;
	var maxDelay : float = 1.0;				// Maximum delay in seconds
	
	CreateObjectOnPlatform(Rider.outlineEffect);
}

function AllCoinsCollected () {
	
	// Checks if all the coins have been collected
	if (buttonBottomed) {
		for (var i = 0; i < objAmount; i ++) {
			if (coins[i] != EMPTY_COIN_SLOT) {
				break;
			}
			if (i == objAmount - 1) {
				return true;
			}
		}
	}
	return false;
}

function CreateShadow () {
	if (myShadow == null) {
		myShadow = ObjectBase.instance.Instantiate(shadow, transform.position);
		if (myShadow != null) {
			var ps : PlatformShadow = myShadow.GetComponent(PlatformShadow);
			ps.caster = myTransform;
			ps.SetLayer(gameObject.layer);
		}
	}
}

function DestroyShadow () {
	if (myShadow != null) {
		ObjectBase.instance.Destroy(myShadow);
		myShadow = null;
	}
}

function CreatePipe () {
	//Wheel.instance.AddToPipeCount(wheel, column);
	new MessageCreatePipe();
	CreateObjectOnPlatform(Rider.pipe);
}

function CreateTransporter () {
	var t : GameObject = CreateObjectOnPlatform(Rider.transporter);
	var transporter : Transporter = t.GetComponent(Transporter);
	transporter.center = center;
	transporter.nextCenter = Wheel.instance.FindCenterTransform(1);
	
}

function CreatePill () {
	hasPill = true;
	CreateObjectOnPlatform(Rider.pill, Vector3 (0.0, 2.5, 0.0));
}

function CreateCrystal () {
	hasCrystal = true;
	CreateObjectOnPlatform(Rider.crystal, Vector3 (0.0, 3.5, 0.0));
}

function CreateDonut () {
	donutType = Inventory.instance.GetDonutCount () + 1;
	hasDonut = true;
	Wheel.instance.SetColumnColor(column, CustomColor.colorProgression[Inventory.instance.GetDonutCount() + 1]);
	new MessageCreateDonut ();
	myDonut = CreateObjectOnPlatform (Rider.donut, Vector3(0.0, 7.5, 0.0));
	myDonut.GetComponent (Donut).CreateDonut (this);
	if (Inventory.instance.GetLastCollectedDonut () < donutType - 1) {
		myDonut.SetActive (false);
	}
}

function OnEnable () {
	if (!hasDonut) return;
	if (!myDonut.activeSelf) {
		if (Inventory.instance.GetLastCollectedDonut () == donutType - 1) {
			myDonut.SetActive (true);
		}
	}
}

function CreateCoinBonus () {
	var c : GameObject = ObjectBase.instance.Instantiate(coinBonus, myTransform.position);
	var coinBonus = c.GetComponent(CoinBonus);
	coinBonus.center = center;
	coinBonus.renderer.materials[1].color = myColor;
}

function CreateReversePlatform () {
	var rp : GameObject = ObjectBase.instance.Instantiate(reversePlatform, myTransform.position);
	var reversePlatform = rp.GetComponent(ReversePlatform);
	rp.transform.position.x -= 10;
	reversePlatform.center = center;
	reversePlatform.speed = speed / 2;
	rp.transform.rotation = myTransform.rotation;
	rp.transform.parent = myTransform;
}

function SetDirty () {
	if (!dirty) {
		Wheel.instance.AddDirtyPlatform (this.gameObject);
		dirty = true;
	}
}

function UnsetDirty () {
	dirty = false;
}

// ----------------------------------------- // Messages // ----------------------------------------- //

function _PressButton () {
	if (!isNearest || bodyType == Rider.bodyMissing || noButton)
		return;
	CreateCoin();
	SetDirty ();
}

function _BottomedButton () {
	if (!isNearest || bodyType == Rider.bodyMissing || noButton)
		return;
	buttonBottomed = true;
	for (var child : Transform in transform) {
		if (child.tag == "Body") {
			child.GetComponent(PlatformBody).Notify();
		}
	}
	CreateObjectOnPlatform(Rider.outlineEffect);
	SetDirty ();
}

function _RestartGame () {
	
	DisassemblePlatform ();
	
	// Reset the qualities
	noButton = false;
	hasPlatform = true;
	coinCount = 0;
	
	canPipe = CanPipe();
	doublePipe = SetDoublePipe();
	column = SetColumn();
	type = SetType();
	bodyType = SetBodyType();
	if (bodyType == Rider.bodyMissing) {
		DestroyObjectOnPlatform (Rider.buttonDummy);
		return;
	}
	
	SetColor();
	bonusType = SetBonusType();
	coinMax = SetCoinMax();
	
	SetCoinPositions();
	SetNoButton ();
	
	if (noButton || bodyType == Rider.nonStatic) {
		DestroyObjectOnPlatform(Rider.buttonDummy);
		DestroyObjectOnPlatform(Rider.button);
	}
	
	if (bodyType == Rider.bodySmall) {
		coinMax = 4;
	}
	
	buttonScale = 0.75;
	buttonBottomed = false;
	
	myTransform.localScale = Vector3.one;
	
	BuildPlatform();
	DeactivateRenderers();
	
}

function DisassemblePlatform () {

	// Destroy everything on the platform
	if (hasPipe && doublePipe) {
		DestroyPipe();
	}
	
	if (inView) {
		if (hasPipe && !doublePipe) {
			DestroyPipe();
		}
	} else {
		hasPipe = false;
		hasPill = false;
		hasCrystal = false;
		hasDonut = false;
	}
	if (hasPlatform) {
		DestroyObjectOnPlatform(bodyType);
	}

}

function GetIDString () : String {
	return row.ToString() + "-" + index.ToString();
}

function SaveDirty () {

	var id : String = GetIDString ();
	
	SaveGameManager.SaveBool (id + "_hasPipe", hasPipe);
	SaveGameManager.SaveBool (id + "_buttonBottomed", buttonBottomed);
	SaveGameManager.SaveFloat (id + "_buttonScale", buttonScale);
	SaveGameManager.SaveBool (id + "_hasPill", hasPill);
	SaveGameManager.SaveBool (id + "_hasCrystal", hasCrystal);
	SaveGameManager.SaveBool (id + "_hasDonut", hasDonut);
	SaveGameManager.SaveInt (id + "_donutType", donutType);
	SaveGameManager.SaveInt (id + "_interval", interval);
	SaveGameManager.SaveInt (id + "_maxInterval", maxInterval);
	SaveGameManager.SaveInt (id + "_coinCount", coinCount);
	
	var cx : float[] = new float[coins.Length];
	var cy : float[] = new float[coins.Length];
	var cz : float[] = new float[coins.Length];
	
	for (var i : int = 0; i < coins.Length; i ++) {
		cx[i] = coins[i].x;
		cy[i] = coins[i].y;
		cz[i] = coins[i].z;
	}
	
	SaveGameManager.SaveFloatArray (id + "_coinsX", cx);
	SaveGameManager.SaveFloatArray (id + "_coinsY", cy);
	SaveGameManager.SaveFloatArray (id + "_coinsZ", cz);
	
	UnsetDirty ();
}

function SaveOnCreate () {
	
	var id : String = GetIDString ();
	
	// These variables never change throughout the course of the game, so we only save them once at the beginning
	SaveGameManager.SaveBool (id + "_hasPlatform", hasPlatform);
	SaveGameManager.SaveInt  (id + "_column", column);
	SaveGameManager.SaveInt  (id + "_bodyType", parseInt(bodyType));
	SaveGameManager.SaveInt  (id + "_type", type);
	SaveGameManager.SaveInt  (id + "_bonusType", bonusType);
	SaveGameManager.SaveBool (id + "_canPipe", canPipe);
	SaveGameManager.SaveBool (id + "_doublePipe", doublePipe);
	SaveGameManager.SaveBool (id + "_noButton", noButton);
	SaveGameManager.SaveInt  (id + "_coinMax", coinMax);
	
	// Overwrite any old saves
	SaveDirty ();
	
}

function _LoadGame () {
	
	DisassemblePlatform ();
	
	var id : String = GetIDString ();
	
	hasPlatform =		SaveGameManager.LoadBool (id + "_hasPlatform");
	column = 			SaveGameManager.LoadInt  (id + "_column");
	bodyType =			SaveGameManager.LoadInt  (id + "_bodyType");
	type =				SaveGameManager.LoadInt  (id + "_type");
	bonusType =			SaveGameManager.LoadInt  (id + "_bonusType");
	canPipe = 			SaveGameManager.LoadBool (id + "_canPipe");
	doublePipe =	 	SaveGameManager.LoadBool (id + "_doublePipe");
	noButton = 			SaveGameManager.LoadBool (id + "_noButton");
	coinMax = 			SaveGameManager.LoadInt  (id + "_coinMax");
	hasPipe = 			SaveGameManager.LoadBool (id + "_hasPipe");
	buttonBottomed = 	SaveGameManager.LoadBool (id + "_buttonBottomed");
	buttonScale	=		SaveGameManager.LoadFloat (id + "_buttonScale");
	hasPill = 			SaveGameManager.LoadBool (id + "_hasPill");
	hasCrystal = 		SaveGameManager.LoadBool (id + "_hasCrystal");
	hasDonut = 			SaveGameManager.LoadBool (id + "_hasDonut");
	donutType = 		SaveGameManager.LoadInt  (id + "_donutType");
	interval = 			SaveGameManager.LoadInt  (id + "_interval");
	maxInterval = 		SaveGameManager.LoadInt  (id + "_maxInterval");
	coinCount = 		SaveGameManager.LoadInt  (id + "_coinCount");
	
	if (inView) {
		if (hasPipe && !doublePipe)
			CreateObjectOnPlatform(Rider.pipe);
		if (hasPill)
			CreateObjectOnPlatform(Rider.pill, Vector3(0.0, 1.5, 0.0));
		if (hasCrystal)
			CreateObjectOnPlatform(Rider.crystal, Vector3(0.0, 2.5, 0.0));
	}
	
	if (noButton || bodyType == Rider.bodyMissing) {
		DestroyObjectOnPlatform (Rider.buttonDummy);
	} else {
		var bd : GameObject = GetObjectOnPlatform (Rider.buttonDummy);
		if (bd != null) bd.GetComponent (ButtonDummy).Init (this);
	}
	
	if (hasDonut) {
		myDonut = CreateObjectOnPlatform (Rider.donut, Vector3(0.0, 7.5, 0.0));
		myDonut.GetComponent (Donut).CreateDonut (donutType, this);
		if (Inventory.instance.GetLastCollectedDonut () < donutType - 1) {
			myDonut.SetActive (false);
		}
	}
	
	SetCoinPositions ();

	var cx : float[] = 	SaveGameManager.LoadFloatArray (id + "_coinsX");
	var cy : float[] =  SaveGameManager.LoadFloatArray (id + "_coinsY");
	var cz : float[] =  SaveGameManager.LoadFloatArray (id + "_coinsZ");
	
	for (var i : int = 0; i < coins.Length; i ++) {
		coins[i] = new Vector3 (cx[i], cy[i], cz[i]);
		if (coins[i] == EMPTY_COIN_SLOT) continue;
		var o : GameObject = CreateObjectOnPlatform(Rider.coin, coins[i], i);
		if (o != null)
			o.GetComponent(Coin).startPosition = coins[i];
	}
	
	SetColor ();
	BuildPlatform ();
	
}


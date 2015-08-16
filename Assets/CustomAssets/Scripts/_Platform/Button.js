#pragma strict
#pragma downcast

private var myTransform : Transform;
private var fullScale : float = 0.75;			// Scale of the button before being pressed

private var player : GameObject;
private var platform : Platform;
private var coinMax : int;						// Total number of coins this button can create
private var coinsCreated : int = 0;
private var coinInterval : float;				// When the button is being pressed, multiples of this value will generate coins

private var startScale : float;
private var min : float = 0.2;
private var pressSpeed : float = 12.0;			

private var heaviness : int = 0;

function Awake () {
	myTransform = transform;
	startScale = myTransform.localScale.x;
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player");
	Messenger.instance.Listen("pipe_player", this);
	
	for (var child : Transform in myTransform) {
		var c : Color[] = [ CustomColor.black, CustomColor.white ];
		child.renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
	}
}

function Init (p : Platform) {
	
	platform = p;
	
	coinMax = p.coinMax;
	coinInterval = 100.0 / coinMax;
	coinsCreated = p.coinCount;
	
	for (var child : Transform in myTransform) {
		child.gameObject.layer = myTransform.parent.gameObject.layer;
	}
	
	SetScale(p);
	
}

function SetScale (p : Platform) {
	myTransform.localScale.x = startScale;
	myTransform.localScale.z = startScale;
	for (var child : Transform in myTransform) {
		child.localScale = Vector3 (1.0, p.buttonScale, 1.0);
		if (p.buttonBottomed)
			child.localScale.y = min;
	}
}

function ResetVariables () {
	
	// Wait until we've found our platform parent
	while (myTransform.parent == null) {
		yield;
	}
	
	// Inherit variables from our new parent
	platform = myTransform.parent.GetComponent(Platform);
	coinMax = platform.coinMax;
	coinInterval = 100.0 / coinMax;
	coinsCreated = platform.coinCount;
	
	//SetPressSpeed();
		
	for (var child : Transform in myTransform) {
		child.gameObject.layer = myTransform.parent.gameObject.layer;
	}
	SetScale();
}

function SetScale () {
	for (var child : Transform in myTransform) {
		child.localScale.y = platform.buttonScale; 
		if (platform.buttonBottomed)
			child.localScale.y = min;
	}
}

function OnTriggerStay (other : Collider) {
	if (other.tag == "Player") {
		for (var child : Transform in transform) {
			
			// Move the button down
			if (child.localScale.y > min) {
				child.localScale.y = Mathf.Lerp(child.localScale.y, min, Time.deltaTime * pressSpeed);
				
				// If we're close to zero, snap it down
				if (child.localScale.y < min) {
					child.localScale.y = min;
				}
				
				// update the platform's scale for when we add the dummy object back in
				platform.buttonScale = child.localScale.y;
				
				// Add the coins																		// 80% of fullscale
				//var pressPercent : float = Mathf.Round(((child.localScale.y - min) / (fullScale - min - (fullScale / 20))) * 100.0);
				var pressPercent : float = Mathf.Round(((child.localScale.y - min) / (fullScale - min)) * 100.0);
				var remainingCoins : int = (coinMax - coinsCreated);
				//Debug.Log(pressPercent);
				
				pressPercent = Mathf.Abs(pressPercent - 100.0);
				while (coinsCreated * coinInterval < pressPercent && coinsCreated < coinMax) {
					new MessagePressButton();
					coinsCreated ++;
					if (coinsCreated == coinMax) {
						new MessageBottomedButton();
					}
				}
			} 
		}
	}
}

function DisableCollider () {
	
	// A bit of a hack, but the platform dictates whether the collider is truly on or off
	// by making it a trigger, the button stops being solid
	for (var child : Transform in transform) {
		child.GetComponent(MeshCollider).isTrigger = true;
	}
}

function EnableCollider () {
	for (var child : Transform in transform) {
		child.GetComponent(MeshCollider).isTrigger = false;
	}
}

function SetPressSpeed () {
	pressSpeed = (40.0 / coinMax) * (heaviness + 1);
	if (pressSpeed > 10.0) 
		pressSpeed = 10.0;
}

function _PipePlayer () {
	if (!platform.isNearest)
		return;
	animation.Play("ButtonShrink");
}

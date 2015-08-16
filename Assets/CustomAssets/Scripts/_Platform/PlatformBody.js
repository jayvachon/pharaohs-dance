#pragma strict

var shadow : GameObject;
var particle : GameObject;
private var myColor : Color;
private var myColorOutline : Color;
private var myColorSecondary : Color;
private var myTransform : Transform;
private var motor : CharacterMotor;
private var center : Transform;

private var player : GameObject;
private var width : float;

private var shadowY : float;
private var shadowRot : Quaternion;

private var myShadow : GameObject;
private var myParticle : GameObject;

var shrinker : boolean = false; 		// Does this platform shrink when the player is on it?
private var fullScale : float;
private var minScale : float = 5.5;
private var resizeSpeed : float = 3.0;
private var stay : boolean = false;
private var triggerExit : boolean = false;

function Awake () {
	myTransform = transform;
	player = GameObject.FindGameObjectWithTag("Player");
	motor = player.GetComponent(CharacterMotor);
	width = renderer.bounds.size.x;
	fullScale = GetHorizontalScale();
}

function OnEnable () {
	if (myTransform.position != ObjectBase.instance.transform.position) {
		UpdateColor();
		SetCenter();
		/*myShadow = ObjectBase.instance.Instantiate(shadow, transform.position);
		if (myShadow != null) {
			var ps : PlatformShadow = myShadow.GetComponent(PlatformShadow);
			ps.caster = myTransform;
			StartCoroutine(SetLayer());
		}*/
		//myParticle = ObjectBase.instance.Instantiate(particle, transform.position);
		/*if (myParticle != null) {
			SetParticle();
		}*/
	}
}

function SetCenter () {
	while (myTransform.parent == null) {
		yield;
	}
	center = myTransform.parent.GetComponent(Platform).center;
}

function SetParticle () {
	while (myTransform.parent == null) {
		yield;
	}
	myParticle.transform.rotation = myTransform.parent.transform.rotation;
	var p : PlatformParticle = myParticle.GetComponent(PlatformParticle);
	p.center = center;
	p.speed = myTransform.parent.GetComponent(Platform).speed;
	
}

function SetLayer () {
	while (myTransform.parent == null) {
		yield;
	}
	myShadow.GetComponent(PlatformShadow).SetLayer(gameObject.layer);
}

function OnDisable () {
	//if (myShadow != null)
		//ObjectBase.instance.Destroy(myShadow);
	if (myParticle != null) 
		ObjectBase.instance.Destroy(myParticle);
}

function OnTriggerEnter (other : Collider) {
	if (other.tag == "Net") {
		if (myTransform.position.y < center.position.y + 5.0 && player.transform.position.y > myTransform.position.y) {
			var targetDir : Vector3 = myTransform.position - center.position;
			var angle : float = Vector3.Angle(targetDir, Vector3.up);
			if (angle < 110) {
				if (myTransform.position.z < 0) {
					if (player.transform.position.z > myTransform.position.z)
						motor.SetVelocity(Vector3.forward * 20.0);
				} else {
					if (player.transform.position.z < myTransform.position.z)
						motor.SetVelocity(Vector3.back * 20.0);
				}
			} else {
				// Uncomment to destroy platform if player lands on its underside
				//StartCoroutine(DestroyOnLeave());
			}
				 
		} else {
			if (shrinker) {
				stay = true;
				Shrink();
				//CancelInvoke ("CoGrow");
				//Invoke ("CoGrow", 1.0);
			}
		}
	}
}

function OnTriggerStay (other : Collider) {
	if (other.tag == "Net") {
		if (myTransform.position.y < center.position.y + 5.0 && player.transform.position.y > myTransform.position.y) {
			var targetDir : Vector3 = myTransform.position - center.position;
			var angle : float = Vector3.Angle(targetDir, Vector3.up);
			//var tossSpeed : float = (120 - angle);
			if (angle < 110) {
				if (myTransform.position.z < 0) {
					motor.SetVelocity(Vector3.forward * 20.0);
				} else {
					motor.SetVelocity(Vector3.back * 20.0);
				}
				/*if (player.transform.position.x > myTransform.position.x) {
					motor.SetVelocity(Vector3.right * tossSpeed);
				} else {
					motor.SetVelocity(Vector3.left * tossSpeed);
				}*/
			}
		}
	}
}

function DestroyOnLeave () {

	// Wait until the player has moved on to a new platform, then destroy this one
	var parent : Platform = transform.parent.GetComponent(Platform);
	while (Application.isPlaying) {
		if (!parent.isNearest) {
			parent.DestroyPlatform();
		}
		yield;
	}
}

function ReturnToStartScale (time : float) {
	var elapsedTime : float = 0.0;
	var startScale : float = GetHorizontalScale();
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		SetHorizontalScale(Mathf.Lerp(startScale, fullScale,(elapsedTime / time)));
		yield;
	}
}

function Grow () {
	if (GetHorizontalScale() < fullScale) {
		SetHorizontalScale(GetHorizontalScale() + resizeSpeed * Time.deltaTime);
	}
}

function Shrink () {
	if (GetHorizontalScale() > minScale) {
		SetHorizontalScale(GetHorizontalScale() - (resizeSpeed) * Time.deltaTime);
		Invoke ("Grow", 3.0);
	}
}

function GetHorizontalScale () : float {
	return myTransform.localScale.x;
}

function SetHorizontalScale (scale : float) {
	myTransform.localScale.x = scale;
	myTransform.localScale.z = scale;
}

function UpdateColor () {

	// Wait until we've found our platform parent
	while (myTransform.parent == null) {
		yield;
	}
	
	var parent : Platform = transform.parent.GetComponent(Platform);
	myColor = parent.myColor;
	myColorOutline = parent.myColorOutline;
	myColorSecondary = parent.myColorSecondary;
	
	var c : Color[] = [ myColorOutline, myColor, myColorSecondary ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
	
	// not color related, just convenient
	center = parent.center;
	
}

function Notify () {
	StartCoroutine(Blink(0.75, myColorOutline, myColor, myColorSecondary));
}

function Blink (duration : float, c0 : Color, c1 : Color, c2 : Color) {

    var end = Time.time + duration;
    var myColorDark : Color = myColor + CustomColor.black;
    
    while (Time.time < end){
    	
    	var flashSpeed : float = 0.01;
    	
    	// White outline
        var c : Color[] = [ CustomColor.white, 
        					c1, 
        					c2 ];
		renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
        yield WaitForSeconds(flashSpeed);
        flashSpeed += 0.005;
        
        // White primary
        c = [ c0, 
        	  CustomColor.white, 
        	  c2 ];
		renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
        yield WaitForSeconds(flashSpeed);
        flashSpeed += 0.005;
        
        // Yellow secondary
		c = [ c0, 
        	  c1,
        	  myColorDark ];
		renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
        yield WaitForSeconds(flashSpeed);
        flashSpeed += 0.005;
        
        // White secondary
        c = [ c0, 
        	  c1,
        	  CustomColor.white ];
		renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
        yield WaitForSeconds(flashSpeed);
        flashSpeed += 0.005;
        
        // Yellow primary
        c = [ c0, 
        	  myColorDark, 
        	  c2 ];
		renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
        yield WaitForSeconds(flashSpeed);
        flashSpeed += 0.005;
		
    }
    
    c = [ c0, c1, c2 ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
}
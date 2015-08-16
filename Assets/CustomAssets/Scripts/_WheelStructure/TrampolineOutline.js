#pragma strict
#pragma downcast

var topTrampoline : boolean = false;	// if this trampoline is above the wheel

private var player : Transform;
private var shader1 : Shader;
private var shader2 : Shader;

private var color : Color[] = new Color[3];

private var yPos : float;
private var myTransform : Transform;

private var transparent : boolean = false;
private var animator : TrampolineAnimator;
private var child : Transform;

private var activated : boolean = false;

var row : int = 0;

private var wheelTop : float;	// top of the wheel

function Awake () {
	myTransform = transform;
}

function Start () {
	
	player = GameObject.FindGameObjectWithTag("Player").transform;
	yPos = myTransform.position.y;
	
	wheelTop = Wheel.rows * Wheel.radius;

	var c : Color[] = [ CustomColor.black, CustomColor.black, CustomColor.dkgrey ];
	renderer.sharedMaterials = MaterialsManager.instance.MaterialsArray (c);
	
	for (var t : Transform in transform) {
		if (t.name == "TrampolineAnimator") {
			animator = t.GetComponent(TrampolineAnimator);
			child = t;
		}
	}

	InvokeRepeating("CheckPlayerPosition", 0.0, 0.125);
	
	Invoke("ShrinkTopTrampoline", 5.0);
			
}

function ColorTrampoline (ci : int) {
	yield WaitForSeconds(5.0);
	animator.ColorTrampoline(ci);
}

function ShrinkTopTrampoline () {
	yield WaitForFixedUpdate();
	if (topTrampoline) {
		DisableColliders();
		animator.Shrink();
	}
}

function CheckPlayerPosition () {
	
	if (topTrampoline) {
		if (player.position.y < wheelTop) {
			return;
		}
	} else {
		if (player.position.y > 40) {
			return;
		}
	}
		
	if (player.position.y < yPos - 10) {
		DisableColliders();
		animator.Shrink();
	} else if (player.position.y > yPos + 5) {
		EnableColliders();
		animator.Grow();
	}
	
}

function EnableColliders () {
	collider.enabled = true;
}

function DisableColliders () {
	collider.enabled = false;
}

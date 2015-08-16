#pragma strict
#pragma downcast

private var myTransform : Transform;
private var fadeLength : float = 0.1875;
private var player : Player;
private var myParachute : Transform;
private var parachuteBody : Transform;

private var minSize : float = 0.5;
private var maxSize : float = 3.0;

private var minY : float = 2.0;
private var maxY : float = 5.0;

function Awake () {
	myTransform = transform;
	renderer.material.color = CustomColor.green;
	renderer.material.color.a = 1.0;
	for (var child : Transform in transform) {
		if (child.name == "Parachute") {
			myParachute = child;
			parachuteBody = myParachute.GetChild (0);
		}
	}
	player = GameObject.FindGameObjectWithTag("Player").GetComponent("Player");
}

function Start () {
	Messenger.instance.Listen("lerp_time", this);
	renderer.material.color = CustomColor.green;
}

function Enable () {
	if (player.parachuting) {
		myParachute.localScale = Vector3.one;
		SetParachuteSize ();
	} else {
		myParachute.localScale = Vector3.zero;
	}
	StartCoroutine(FadeOut(fadeLength));
}

function SetParachuteSize () {
	var percent : float = (Inventory.instance.GetItemValue(Item.parachute) + 0.0) / 5.0;
	var newScale : float = ((maxSize - minSize) * percent) + minSize;
	parachuteBody.localScale = Vector3(newScale, newScale, newScale) * 2;
	parachuteBody.localPosition.y = ((maxY - minY) * percent) + minY;
}

function FadeOut (time : float) {
	var elapsedTime : float = 0.0;
	
	while (elapsedTime < time) {
		elapsedTime += Time.deltaTime;
		
		var alpha : float = Mathf.Lerp(1.0, 0.0, elapsedTime / time);
		renderer.material.color.a = alpha;
		
		parachuteBody.renderer.material.color.a = alpha;
		
		for (var child : Transform in transform) {
			if (child.name == "OxygenTank")
				child.renderer.material.color.a = alpha;
			
			for (var c : Transform in child.transform) {
				if (c.name == "EyeL" || c.name == "EyeR") {
					c.renderer.materials[0].color.a = alpha;
					c.renderer.materials[1].color.a = alpha;
				}
			}
		}
		
		yield;
	}
}

function _LerpTime () {
	var ts : float = Mathf.Max(0.01, TimeController.instance.GetCurrentScale());
	fadeLength = (0.25 / ts);
}
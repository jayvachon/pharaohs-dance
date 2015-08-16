#pragma strict

var reverser : GameObject;
var coinTrail : GameObject;
var airBonus : GameObject;
var height : float = 3.5;	// How high it will be above the platforms

private var reversers : GameObject[];
private var trails : GameObject[];
private var airBonuses : GameObject[];

function Start () {

	reversers = new GameObject[Wheel.rows];
	trails = new GameObject[Wheel.rows];
	airBonuses = new GameObject[Wheel.rows];
	
	CreateReversers();
	CreateCoinTrails();
	CreateAirBonuses();
	
}

function CreateReversers () {	

	var deg : float = 90.0;
	for (var i = 1; i < Wheel.rows; i ++) {
		var r : float = ((i + 1) * Wheel.radius) + height;
		var rad = (i * deg) * Mathf.Deg2Rad;
		var y : float = Mathf.Cos(rad) * r;
		var z : float = Mathf.Sin(rad) * r;
		reversers[i] = GameObject.Instantiate(reverser, Vector3(0.0, y, z), Quaternion.identity);
		if (Mathf.Abs(z) < 5.0) {
			reversers[i].transform.localEulerAngles.y = (i * deg) + deg;
		} else {
			reversers[i].transform.localEulerAngles.z = (i * deg);
		}
		reversers[i].transform.parent = Wheel.reverseCenters[0];
	}
	
}

function CreateCoinTrails () {

	var sign : float = 1.0;
	for (var i = 0; i < Wheel.rows; i += 2) {
		var y : float = (Wheel.radius * (i + 2)) + height;	// TRY CHANGING 2 TO 3 
		y *= sign;
		trails[i] = Instantiate(coinTrail, Vector3(0.0, y, 0.0), Quaternion.identity);
		trails[i].transform.parent = Wheel.reverseCenters[0];
		trails[i].GetComponent(CoinTrail).startSign = sign;
		sign *= -1;
	}
	
}

function CreateAirBonuses () {

	var deg : float = 45.0;
	
	for (var i = 3; i < Wheel.rows; i += 5) {
	
		var r : float = ( Wheel.radius * (i + 1) ) + (height * 1.25);
		var rad = ( (i * 180.0) + deg ) * Mathf.Deg2Rad;
		
		var y : float = Mathf.Cos(rad) * r;
		var z : float = Mathf.Sin(rad) * r;
		
		airBonuses[i] = Instantiate(airBonus, Vector3(0.0, y, z), Quaternion.identity);
		airBonuses[i].transform.parent = Wheel.reverseCenters[0];
		
	}
	
}
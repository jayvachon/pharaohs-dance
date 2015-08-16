#pragma strict

private var mats : Material[] = new Material[0];

static var instance : MaterialsManager;

function Awake () {
	instance = this;
}

// Call this function to use one of the materials in the manager
// The manager automatically creates a new material if it doesn't exist yet
function MaterialColor (color : Color) : Material {
	
	if (mats.Length == 0)
		return AddNewMaterialToArray (color);
	
	for (var i = 0; i < mats.Length; i ++) {
		if (mats[i].color == color)
			return mats[i];
	}
	
	return AddNewMaterialToArray (color);
}

// Same as above, except it takes an array of colors and returns an array of materials
function MaterialsArray (colors : Color[]) : Material[] {
	var arr : Material[] = new Material[colors.Length];
	for (var i = 0; i < colors.Length; i ++) {
		arr[i] = MaterialColor(colors[i]);
	}
	return arr;
}

function AddNewMaterialToArray (color : Color) : Material {
	mats = ResizeArray (mats);
	var m : Material = CreateMaterial (color);
	mats[mats.Length - 1] = m;
	return m;
}

function CreateMaterial (color : Color) {
	if (color.a > 0.99)
		var m : Material = new Material(Shader.Find("Diffuse"));
	else
		m = new Material(Shader.Find("Transparent/Diffuse"));
	m.color = color;
	return m;
}

function ResizeArray (arr : Material[]) {
	System.Array.Resize.<Material>(arr, arr.Length + 1);
	return arr;
}
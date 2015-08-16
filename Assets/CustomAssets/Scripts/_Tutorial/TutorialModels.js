#pragma strict

var models : GameObject[];

function SetModel (screen : int) {

	for (var i = 0; i < models.Length; i ++) {
		models[i].gameObject.SetActive(false);
	}
	
	if (screen > models.Length - 1) {
		models[0].gameObject.SetActive(true);
		return;
	}
	
	models[screen].gameObject.SetActive(true);
	
}
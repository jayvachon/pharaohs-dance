using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class EnergyManager : Manager {
	
	public static EnergyManager instance;
	public Children<Energy> energies;
	
	void Awake () {
		name = "EnergyManager";
		if (instance == null) { instance = this; }
		energies = new Children<Energy>(transform);
		AudioManager.instance.managers.AddChild (GetComponent<EnergyManager>());
	}

}

#pragma strict

private var ps : ParticleSystem;
private var duration : float = 3.0;

function Start () {
	ps = GetComponent(ParticleSystem);
	ps.loop = true;
}

function Burst () {

	ps.Stop();
	ps.Clear();
	
	ps.loop = false;
	ps.playbackSpeed = 3.0;
	ps.Play();
	
}


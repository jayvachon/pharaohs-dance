#pragma strict

private var ps : ParticleSystem;
private var player : Transform;

function Awake () {
	ps = GetComponent(ParticleSystem);
}

function Start () {
	player = GameObject.FindGameObjectWithTag("Player").transform;
}

/*function MoveToPlayer () {

	var particles : ParticleSystem.Particle[] = new ParticleSystem.Particle[ps.particleCount];
	var num : int = ps.GetParticles(particles);
	var playerPos : Vector3 = Vector3(player.position.x, -player.position.z, player.position.y);
	
	for (var i = 0; i < num; i ++) {
		var pos : Vector3 = particles[i].position;
		var dir : Vector3 = playerPos - pos; 
		particles[i].velocity = Vector3.Lerp(particles[i].velocity, dir * 10.0, 1.0 * Time.deltaTime);
		
		if (Vector3.Distance(pos, playerPos) < 5.0) {
			particles[i].color.a = 0.0;
		}
	}
	
	ps.SetParticles(particles, num);
}*/

function MoveToPlayer () {
	
	var time : float = 0.5;
	var eTime : float = 0.0;
	
	var particles : ParticleSystem.Particle[] = new ParticleSystem.Particle[ps.particleCount];
	var num : int = ps.GetParticles(particles);
	
	var startPositions : Vector3[] = new Vector3[num];
	for (var i = 0; i < num; i ++) {
		startPositions[i] = particles[i].position;
	}
	
	while (eTime < time) {
		eTime += Time.deltaTime;
		for (i = 0; i < num; i ++) {
			
			var playerPos : Vector3 = Vector3(player.position.x, -player.position.z, player.position.y);
			particles[i].position = Vector3.Lerp(startPositions[i], playerPos, eTime / time);
			
			var dis : float = Vector3.Distance(particles[i].position, playerPos);
			if (dis < 5.0) {
				particles[i].color.a = dis / 5.0;
			}
			
		}
		ps.SetParticles(particles, num);
		yield;
	}
	
}

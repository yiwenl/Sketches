// ClusterChecker.js
import Cluster from './Cluster';
let clusterfck = require("clusterfck");

class ClusterChecker {
	constructor() {
		this._clusters = [];
		this._maxSize = 0;
	}


	check(pixels) {
		let particles = [];
		let num = params.numParticles * params.numParticles;
		for(let i=0; i<num; i+= 4) {
			particles.push([pixels[i], pixels[i+1], pixels[i+2]]);
		}

		let clusters = clusterfck.kmeans(particles, 5);
		let newClusters = [];

		for(let i=0; i<clusters.length ; i++ ) {
			let cluster = clusters[i];
			let center = [0, 0, 0];
			for(let j=0; j<cluster.length; j++) {
				let p = cluster[j];

				center[0] += p[0];
				center[1] += p[1];
				center[2] += p[2];
			}

			center[0]/= cluster.length;
			center[1]/= cluster.length;
			center[2]/= cluster.length;

			let distances = [];
			for(let j=0; j<this._clusters.length; j++) {
				let c = this._clusters[j];
				let d = c.distance(center);
				distances.push(d);
			}


			newClusters.push({
				position:center,
				num:cluster.length,
				distances:distances,
				picked:false
			});

			if(cluster.length > this._maxSize) {
				this._maxSize = cluster.length;
				console.debug('Max Size : ', this._maxSize, distances);
			}
		}


		if(this._clusters.length === 0) {
			for(let i=0; i<newClusters.length; i++) {
				let cluster = newClusters[i];
				let strength = cluster.num / 600;
				let c = new Cluster(cluster.position, strength);

				this._clusters.push(c);
			}

			return;
		}


		const threshold = 2.0;

		let needToCheck = true;
		let minDist = 0.0;
		let ia, ib;
		let cnt = 0;

		while(needToCheck) {
			minDist = -1;
			for(let j=0; j<newClusters.length; j++) {
				let c = newClusters[j];
				if(c.picked) continue;

				let distances = c.distances;
				for(let i=0; i<distances.length; i++) {
					let d = distances[i];
					if(minDist < 0) {
						minDist = d;
						ia = j;
						ib = i;
					} else {
						if(d < minDist) {
							minDist = d;

							ia = j;
							ib = i;
						}
					}

				}
			}


			//	removing



			
			if(minDist > threshold) {	needToCheck = false;	}
			if(minDist < 0) {	
				console.debug('no distance');
				needToCheck = false;	
			}

			if(cnt ++ > 100) {
				needToCheck = false;
			}
		}
		

	}


	get clusters() {
		return this._clusters;
	}
}


export default ClusterChecker;
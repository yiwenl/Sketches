// ClusterChecker.js
import Cluster from './Cluster';
import alfrid from './libs/alfrid.js';
let clusterfck = require("clusterfck");

const MAX_NUM = 600;
const MAX_DISTANCE = 1.0;

class ClusterChecker extends alfrid.EventDispatcher {
	constructor(callback) {
		super();
		this._clusters = [];
		this._maxSize = 0;
		this._callback = callback;
	}


	check(pixels) {
		let particles = [];
		let num = params.numParticles * params.numParticles;
		for(let i=0; i<num; i+= 4) {
			particles.push([pixels[i], pixels[i+1], pixels[i+2]]);
		}

		let clusters = clusterfck.kmeans(particles, params.numClusters);
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
				linkedIndex:-1,
				picked:false
			});

			if(cluster.length > this._maxSize) {
				this._maxSize = cluster.length;
			}
		}


		//	FIRST TIME CREATION

		if(this._clusters.length === 0) {
			for(let i=0; i<newClusters.length; i++) {
				let cluster = newClusters[i];
				let strength = cluster.num / MAX_NUM;
				let c = new Cluster(cluster.position, strength);

				this._clusters.push(c);
			}

			return;
		}


		//	CHECK DISTANCES

		const threshold = MAX_DISTANCE;

		let needToCheck = true;
		let minDist = 0.0;
		let ia, ib;
		let cnt = 0;

		while(needToCheck) {
			minDist = -1;
			for(let j=0; j<newClusters.length; j++) {
				let c = newClusters[j];
				if(!c.picked) {
					let distances = c.distances;
					for(let i=0; i<distances.length; i++) {
						let d = distances[i];
						if(minDist < 0 ) {
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
			}



			//	removing
			if(minDist < threshold) {
				newClusters[ia].picked = true;
				newClusters[ia].linkedIndex = ib;	
			}


			if(minDist > threshold) {	
				needToCheck = false;	
			}
			if(minDist < 0) {	
				needToCheck = false;	
			}

			if(cnt ++ > 100) {
				console.debug('Overflow');
				needToCheck = false;
			}
		}



		//	UPDATE CLUSTER / NEW CLUSTER
		let pickedIndices = [];
		let tmp = [];
		for(let i=0; i<newClusters.length; i++) {
			let cluster = newClusters[i];
			if(cluster.linkedIndex >= 0) {
				this._clusters[cluster.linkedIndex].update(cluster.position, cluster.num/MAX_NUM);
				pickedIndices.push(i);
			} else {
				let c = new Cluster(cluster.position, cluster.num/MAX_NUM);
				tmp.push(c);
			}
		}

		//	FADE CLUSTERS THAT NOT EXIST ANYMORE
		for(let i=0; i<this._clusters.length; i++) {
			if(pickedIndices.indexOf(i) < 0) {
				this._clusters[i].setStrength(0);
			}
		}


		//	REMOVE CLUSTERS THAT DIED
		let i = this._clusters.length;
		while(i--) {
			if(this._clusters[i].isDead){
				this._clusters.splice(i, 1);
			}
		}


		this._clusters = this._clusters.concat(tmp);

		if(tmp.length > 0) {
			if(this._callback) {
				this._callback(tmp.length);
			}
		}
		
	}


	get clusters() {
		return this._clusters;
	}
}


export default ClusterChecker;
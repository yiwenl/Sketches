// ViewSave.js

import alfrid, { GL } from 'alfrid';

const vsSave = require('../../shaders/save.vert');
const fsSave = require('../../shaders/save.frag');
const random = function (min, max) { return min + Math.random() * (max - min);	};

class ViewSave extends alfrid.View {
	
	constructor() {
		super(vsSave, fsSave);
	}


	_init() {
		const positions = [];
		const coords = [];
		const indices = []; 
		const extras = [];
		const speedLimit = [];
		let count = 0;

		const numParticles = params.numParticles;
		const totalParticles = numParticles * numParticles;
		console.debug('Total Particles : ', totalParticles);
		let ux, uy;
		const range = 5;
		const speedScale = .0005 * params.skipCount;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				positions.push([random(-range, range), random(1.5, range), random(-range, range)]);

				ux = i / numParticles * 2.0 - 1.0 + .5 / numParticles;
				uy = j / numParticles * 2.0 - 1.0 + .5 / numParticles;

				extras.push([Math.random(), Math.random(), Math.random()]);
				speedLimit.push([random(1, 3) * speedScale, random(5, 18) * speedScale, 0.0]);
				coords.push([ux, uy]);
				indices.push(count);
				count ++;

			}
		}


		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);

		this.meshExtra = new alfrid.Mesh(GL.POINTS);
		this.meshExtra.bufferVertex(extras);
		this.meshExtra.bufferTexCoord(coords);
		this.meshExtra.bufferIndex(indices);

		this.meshSpeed = new alfrid.Mesh(GL.POINTS);
		this.meshSpeed.bufferVertex(speedLimit);
		this.meshSpeed.bufferTexCoord(coords);
		this.meshSpeed.bufferIndex(indices);
	}


	render(state = 0) {
		this.shader.bind();
		if(state === 0) {
			GL.draw(this.mesh);	
		} else if(state === 1) {
			GL.draw(this.meshExtra);	
		} else {
			GL.draw(this.meshSpeed);
		}
		
	}


}

export default ViewSave;
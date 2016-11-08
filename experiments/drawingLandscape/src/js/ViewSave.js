// ViewSave.js

import alfrid from 'alfrid';

const vsSave = require('../shaders/save.vert');
const fsSave = require('../shaders/save.frag');
const GL = alfrid.GL;
const random = function (min, max) { return min + Math.random() * (max - min);	};

class ViewSave extends alfrid.View {
	
	constructor() {
		super(vsSave, fsSave);
	}


	_init() {
		this.reset();
	}

	reset(mPos) {
		let positions = [];
		let coords = [];
		let indices = []; 
		let extras = [];
		let count = 0;

		let numParticles = params.numParticles;
		let totalParticles = numParticles * numParticles;
		console.debug('Total Particles : ', totalParticles);
		let ux, uy;
		let range = params.maxRadius;


		function getRandomPos() {
			let pos = mPos[Math.floor(Math.random() * mPos.length)];

			const range = 0.005;
			const rangeY = 0.01;

			pos[0] += random(-range, range);
			pos[1] += random(-rangeY, rangeY);
			pos[2] += random(-range, range);

			return pos;
		}


		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				if(!mPos) {
					positions.push([random(-range, range), 9999, random(-range, range)]);	
				} else {
					positions.push(getRandomPos());
				}
				

				ux = i / numParticles * 2.0 - 1.0 + .5 / numParticles;
				uy = j / numParticles * 2.0 - 1.0 + .5 / numParticles;

				extras.push([Math.random(), Math.random(), Math.random()]);
				coords.push([ux, uy]);
				indices.push(count);
				count ++;

			}
		}

		if(!this.mesh) {
			this.mesh = new alfrid.Mesh(GL.POINTS);	
		}
		
		this.mesh.bufferVertex(positions);
		this.mesh.bufferData(extras, 'aExtra', 3);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);
	}


	render(state = 0) {
		this.shader.bind();
		// if(state === 0) {
		// 	GL.draw(this.mesh);	
		// } else if(state === 1) {
		// 	GL.draw(this.meshExtra);	
		// }
		GL.draw(this.mesh);
	}


}

export default ViewSave;
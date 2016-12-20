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
		let positions = [];
		let coords = [];
		let indices = []; 
		let extras = [];
		let count = 0;

		let {numParticles, terrainSize} = params;
		let totalParticles = numParticles * numParticles;
		console.debug('Total Particles : ', totalParticles);
		let ux, uy;
		let range = params.terrainSize / 2;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				positions.push( [ (i/numParticles - .5) * terrainSize, 0,  (j/numParticles - .5) * terrainSize * 0.75]);
				// positions.push([random(-range, range), random(0, 5) + 2, random(-range*0.6, range*0.6)]);

				ux = i / numParticles * 2.0 - 1.0 + .5 / numParticles;
				uy = j / numParticles * 2.0 - 1.0 + .5 / numParticles;

				extras.push([Math.random(), Math.random(), Math.random()]);
				coords.push([ux, uy]);
				indices.push(count);
				count ++;

			}
		}


		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferData(extras, 'aExtra', 3);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);

		// this.meshExtra = new alfrid.Mesh(GL.POINTS);
		// this.meshExtra.bufferVertex(extras);
		// this.meshExtra.bufferTexCoord(coords);
		// this.meshExtra.bufferIndex(indices);
	}

	reset() {
		let positions = [];
		let extras = [];
		let {numParticles, terrainSize} = params;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				positions.push( [ (i/numParticles - .5) * terrainSize, 0,  (j/numParticles - .5) * terrainSize * 0.75]);
				extras.push([Math.random(), Math.random(), Math.random()]);
			}
		}

		this.mesh.bufferVertex(positions);
		this.mesh.bufferData(extras, 'aExtra', 3);
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
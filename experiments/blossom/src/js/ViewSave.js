// ViewSave.js

import alfrid from 'alfrid';

const vsSave = require("../shaders/save.vert");
const fsSave = require("../shaders/save.frag");
const GL = alfrid.GL;
const random = function(min, max) { return min + Math.random() * (max - min);	}

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

		let numParticles = params.numParticles;
		let totalParticles = numParticles * numParticles;
		console.debug('Total Particles : ', totalParticles);
		let ux, uy;
		let range = .25;

		for(let j=0; j<numParticles; j++) {
			for(let i=0; i<numParticles; i++) {
				positions.push([random(-range, range), random(-range, range)+1, random(-range, range)]);

				ux = i/numParticles*2.0-1.0+.5/numParticles;
				uy = j/numParticles*2.0-1.0+.5/numParticles;

				extras.push([Math.random(), Math.random(), Math.random()]);
				coords.push([ux, uy]);
				indices.push(count);
				count ++;

			}
		}


		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);

		this.meshExtra = new alfrid.Mesh(GL.POINTS);
		this.meshExtra.bufferVertex(extras);
		this.meshExtra.bufferTexCoords(coords);
		this.meshExtra.bufferIndices(indices);
	}


	render(state=0) {
		this.shader.bind();
		if(state === 0) {
			GL.draw(this.mesh);	
		} else if(state === 1) {
			GL.draw(this.meshExtra);	
		}
		
	}


}

export default ViewSave;
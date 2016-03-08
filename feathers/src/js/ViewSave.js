// ViewSave.js

import alfrid from './libs/alfrid.js';

let glslify = require("glslify");

let random = function(min, max) { return min + Math.random() * (max - min);	}

let GL;

class ViewSave extends alfrid.View {
	constructor() {

		GL = alfrid.GL;

		super(glslify('../shaders/save.vert'), glslify('../shaders/save.frag') );

	}


	_init() {
		

		let positions = [];
		let extras = [];
		let coords = [];
		let indices = []; 
		let count = 0;

		let numParticles = params.numParticles;
		let totalParticles = numParticles * numParticles;
		let ux, uy;
		let range = 1.5;

		for(let j=0; j<numParticles; j++) {
			for(let i=0; i<numParticles; i++) {
				positions.push([random(-range, range), random(-range, range), random(-range, range)]);
				extras.push([Math.random(), Math.random(), Math.random()]);

				ux = i/numParticles*2.0-1.0 + .5/numParticles;
				uy = j/numParticles*2.0-1.0 + .5/numParticles;
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
		if(state == 0) {
			GL.draw(this.mesh);	
		} else if(state == 1) {
			GL.draw(this.meshExtra);
		}
		
		
	}

}


export default ViewSave;

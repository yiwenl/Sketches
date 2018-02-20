// ViewSave.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/save.vert';
import fs from 'shaders/save.frag';
const random = function (min, max) { return min + Math.random() * (max - min);	};

class ViewSave extends alfrid.View {
	
	constructor() {
		super(vs, fs);
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
		const {maxRadius, maxY} = params.particles;

		function getPos() {
			let a = Math.random() * Math.PI * 2.0;
			let r = maxRadius * Math.sqrt(Math.random());
			let y = maxY;
			return [Math.cos(a) * r, random(-y, y), Math.sin(a) * r];
		}

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				positions.push(getPos());

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
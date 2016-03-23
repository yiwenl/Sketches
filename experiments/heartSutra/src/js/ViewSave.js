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
		//	SAVE FOR POSITION
		//	SAVE FOR RANDOM

		let positions = [];
		let coords = [];
		let indices = []; 
		let extras = [];
		let speedLimit = [];
		let count = 0;

		let numParticles = params.numParticles;
		let totalParticles = numParticles * numParticles;
		let ux, uy;
		let range = 4;
		let speedScale = .0005 * params.skipCount;

		function getPosition() {
			let rx = random(-0.75, 0.75);
			let ry = Math.random() * Math.PI * 2.0;

			let r = random(range, range + 1);
			let y = Math.sin(rx) * r;
			let tr = Math.cos(rx) * r;
			let x = Math.cos(ry) * tr;
			let z = Math.sin(ry) * tr;

			return [x, y, z];
		}

		for(let j=0; j<numParticles; j++) {
			for(let i=0; i<numParticles; i++) {
				positions.push( getPosition() );

				ux = i/numParticles*2.0-1.0+.5/numParticles;
				uy = j/numParticles*2.0-1.0+.5/numParticles;

				extras.push([Math.random(), Math.random(), Math.random()]);
				speedLimit.push([random(1, 3)*speedScale, random(5, 18)*speedScale, 0.0]);
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

		this.meshSpeed = new alfrid.Mesh(GL.POINTS);
		this.meshSpeed.bufferVertex(speedLimit);
		this.meshSpeed.bufferTexCoords(coords);
		this.meshSpeed.bufferIndices(indices);
	}


	render(state=0) {

		this.shader.bind();
		if(state == 0) {
			GL.draw(this.mesh);
		} else if(state == 1) {
			GL.draw(this.meshExtra);
		} else {
			GL.draw(this.meshSpeed);
		}
		
		
	}

}


export default ViewSave;

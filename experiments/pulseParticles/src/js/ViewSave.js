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

		let numParticles = params.numParticles;
		let totalParticles = numParticles * numParticles;
		console.debug('Total Particles : ', totalParticles);
		let ux, uy;
		let range = 2;

		let m = mat4.create();
		let r , q, a;
		const { PI } = Math;
		q = quat.create();

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				r = random(range-.1, range);
				let v = vec3.fromValues(0, 0, r);
				mat4.identity(m, m);
				a = vec3.fromValues(random(-1, 1), random(-1, 1), random(-1, 1));
				vec3.normalize(a, a);
				quat.setAxisAngle(q, a, random(-PI, PI));
				vec3.transformQuat(v, v, q);
				// v[1] *= 0.75;
				// positions.push([random(-range, range), random(-range, range), random(-range, range)]);
				positions.push(v);
				ux = i / numParticles * 2.0 - 1.0 + .5 / numParticles;
				uy = j / numParticles * 2.0 - 1.0 + .5 / numParticles;

				extras.push([Math.random(), Math.random(), 0.0]);
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
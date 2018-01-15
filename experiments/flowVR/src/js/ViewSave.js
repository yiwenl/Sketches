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

		const { numParticles, ringRadius, ringSize } = params;
		let totalParticles = numParticles * numParticles;
		console.debug('Total Particles : ', totalParticles);
		let ux, uy;
		let range = 3;
		const m = mat4.create();

		const getPos = () => {
			const r = Math.sqrt(Math.random()) * params.maxRadius;
			const v = vec3.fromValues(r, 0, 0);
			mat4.identity(m);
			mat4.rotateX(m, m, Math.random() * Math.PI * 2);
			mat4.rotateY(m, m, Math.random() * Math.PI * 2);
			mat4.rotateZ(m, m, Math.random() * Math.PI * 2);

			vec3.transformMat4(v, v, m);
			return v;
		}

		const getRingPos = () => {
			const r = Math.sqrt(Math.random()) * ringSize;
			let a = Math.random() * Math.PI * 2.0;

			let x = Math.cos(a) * r + ringRadius;
			let y = Math.sin(a) * r;

			let v = vec3.fromValues(x, y, 0);
			a = Math.random() * Math.PI * 2.0;
			mat4.identity(m, m);
			mat4.rotateY(m, m, a);
			vec3.transformMat4(v, v, m);


			return v;
		}

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				// positions.push([random(-range, range), random(-range, range), random(-range, range)]);
				positions.push(getRingPos());

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
	}


	render(state = 0) {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewSave;
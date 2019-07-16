// ViewSave.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/save.vert';
import fs from 'shaders/save.frag';
import Config from './Config';
import { random } from 'randomutils';

class ViewSave extends alfrid.View {
	
	constructor(numParticles, zOffset = 0) {
		super(vs, fs);

		this._numParticles = numParticles;
		this._zOffset = zOffset;

		this._initMesh();
	}


	_initMesh() {
		let positions = [];
		let coords = [];
		let indices = []; 
		let extras = [];
		let count = 0;

		let numParticles = Config.numParticles || this._numParticles;
		let ux, uy;
		let range = 3;
		const m = mat4.create();

		const { ringSize, ringRadius, zOffset } = Config;

		const getPos = () => {
			let a = random(Math.PI * 2);
			let r = Math.sqrt(Math.random()) * ringSize;
			let x = Math.cos(a) * r;
			let z = Math.sin(a) * r;

			let v = vec3.fromValues(x + ringRadius, 0, z + zOffset + this._zOffset);
			mat4.identity(m);
			a = random(Math.PI * 2);
			mat4.rotateZ(m, m, a);
			vec3.transformMat4(v, v, m);

			return v;
		}

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				// positions.push([random(-range, range), random(-range, range), random(-range, range)]);
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
	}


	render(state = 0) {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewSave;
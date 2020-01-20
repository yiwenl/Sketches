// DrawSave.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import { random } from 'randomutils'

import vs from 'shaders/save.vert';
import fs from 'shaders/save.frag';

class DrawSave extends alfrid.Draw {

	constructor() {
		super();

		const { numParticles } = Config;
		const positions = [];
		const uvs = [];
		const normals = [];
		const indices = [];
		let count = 0;
		const r = 0.02;


		const getPos = (count) => {
			const a = random(Math.PI * 2);
			const rr = Math.sqrt(Math.random()) * r;

			return [Math.cos(a) * rr, Math.sin(a) * rr, count];
		}

		for(let i = 0; i < numParticles; i++) {
			for(let j = 0; j <numParticles; j++) {
				// positions.push([random(-r, r), random(-r, r), count]);
				positions.push(getPos(count));
				uvs.push([i/numParticles * 2 - 1 + 0.5/numParticles, j/numParticles * 2 - 1 + 0.5/numParticles]);
				indices.push(count);
				count++;
			}
		}


		this.createMesh(GL.POINTS)
			.bufferVertex(positions)
			.bufferTexCoord(uvs)
			.bufferIndex(indices)
			.useProgram(vs, fs);
	}

}

export default DrawSave;
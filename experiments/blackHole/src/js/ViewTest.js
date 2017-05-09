// ViewTest.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/test.vert';
import fs from 'shaders/test.frag';

class ViewTest extends alfrid.View {
	
	constructor(numParticles = 32) {
		super(vs, fs);
		this._numParticles = numParticles;
		this._initMesh();
	}


	_initMesh() {
		const w = 2;
		const h = 0.2;
		// this.mesh = alfrid.Geom.plane(s, s * .15, 20);

		this.mesh = new alfrid.Mesh();

		const positions = [];
		const coords = [];
		const indices = [];
		const num = 5;
		let count = 0;

		function getPos(i, j) {
			let x = -w/2 + i/num * w;
			let y = -h/2 + j * h;
			return [x, y, 0];
		}

		for(let i=0; i<num; i++) {
			for(let j=0; j<1; j++) {
				positions.push(getPos(i, j));
				positions.push(getPos(i+1, j));
				positions.push(getPos(i+1, j+1));
				positions.push(getPos(i, j+1));

				coords.push([i/num, j]);
				coords.push([(i+1)/num, j]);
				coords.push([(i+1)/num, j+1]);
				coords.push([i/num, j+1]);

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);

				count ++;
			}
		}

		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);


		let uvs = [];
		let numParticles = this._numParticles;
		let ux, uy;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				uvs.push([ux, uy]);
			}
		}

		this.mesh.bufferInstance(uvs, 'aUV');
	}


	render(textureCurr, textureNext, p, textureExtra, isBlack = false, mWidth = 1) {
		GL.disable(GL.CULL_FACE);
		this.time += 0.1;
		this.shader.bind();

		this.shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		this.shader.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		this.shader.uniform('percent', 'float', p);
		this.shader.uniform("isBlack", "float", isBlack ? 1.0 : 0.0);
		this.shader.uniform("uWidth", "float", mWidth);
		// this.shader.uniform('time', 'float', this.time);
		GL.draw(this.mesh);
		GL.enable(GL.CULL_FACE);
	}



}

export default ViewTest;
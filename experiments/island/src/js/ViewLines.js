// ViewLines.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/lines.vert';
import fs from '../shaders/lines.frag';

class ViewLines extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { numParticles } = params;
		let positions    = [];
		let indices      = []; 
		let count        = 0;
		let ux, uy;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				positions.push([ux, uy, 0]);
				positions.push([ux, uy, 1]);

				indices.push(count);
				indices.push(count+1);
				count += 2;
			}
		}

		this.mesh = new alfrid.Mesh(GL.LINES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);

		this.shader.bind();
		const s = 0.4;
		this.shader.uniform("color", "vec3", [s, s, s]);
		this.shader.uniform("opacity", "float", .25);
		this.shader.uniform("textureCurr", "uniform1i", 0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		this.shader.uniform("textureExtra", "uniform1i", 2);
		this.shader.uniform("uNumSeg", "float", params.numSeg);
		this.shader.uniform(params.lineLife);
	}


	render(textureCurr, textureNext, textureExtra) {
		this.shader.bind();
		textureCurr.bind(0);
		textureNext.bind(1);
		textureExtra.bind(2);
		GL.draw(this.mesh);
	}


}

export default ViewLines;
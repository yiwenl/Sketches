// ViewLines.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/lines.vert';

class ViewLines extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);
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
	}


	render(textureCurr, textureNext) {
		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 0, 0]);
		this.shader.uniform("opacity", "float", 1);
		this.shader.uniform("textureCurr", "uniform1i", 0);
		textureCurr.bind(0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		textureNext.bind(1);
		GL.draw(this.mesh);
	}


}

export default ViewLines;
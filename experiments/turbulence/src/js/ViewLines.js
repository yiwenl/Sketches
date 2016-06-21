// ViewLines.js

import alfrid, { GL } from 'alfrid';
import vsLines from '../shaders/lines.vert';
import fs from '../shaders/lines.frag';

class ViewLines extends alfrid.View {
	
	constructor() {
		let strUniforms = '';
		for(let i=0; i<params.numFbos; i++) {
			strUniforms += `uniform sampler2D texture${i};\n`;
		}

		const vs = vsLines.replace('{{uniformTextures}}', strUniforms);
		super(vs, fs);
	}


	_init() {
		const numParticles = params.numParticles;
		const positions = [];
		const indices = [];
		let count = 0;
		let ux, uy;
		

		for(let i=0; i<params.numParticles; i++) {
			for(let j=0; j<params.numParticles; j++) {
				for(let k=0; k<params.numFbos-1; k++) {
					ux = i / numParticles;
					uy = j / numParticles;

					positions.push([ux, uy, k]);
					positions.push([ux, uy, k+1]);

					indices.push(count*2);
					indices.push(count*2+1);

					count ++;
				}
			}
		}

		this.mesh = new alfrid.Mesh(GL.LINES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);
	}


	render(fbos, textureGradient) {
		this.shader.bind();

		for(let i=0; i<fbos.length; i++) {
			this.shader.uniform(`texture${i}`, "uniform1i", i);
			fbos[i].getTexture(0).bind(i);
		}

		this.shader.uniform("textureGradient", "uniform1i", fbos.length);
		textureGradient.bind(fbos.length);
		GL.draw(this.mesh);
	}


}

export default ViewLines;
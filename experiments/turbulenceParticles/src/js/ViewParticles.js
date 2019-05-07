// ViewParticles.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/particles.vert';
import fs from 'shaders/particles.frag';

class ViewParticles extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const num = 256;

		const positions = [];
		const uvs = [];
		const indices = [];
		let count = 0;
		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {

				let u = i/num - 0.5/num;
				let v = j/num - 0.5/num;

				positions.push([Math.random(), Math.random(), Math.random()]);
				uvs.push([u, v]);
				indices.push(count);
				count ++;
			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);
	}


	render(texturePos, textureDensity) {
		this.shader.bind();
		this.shader.uniform("texturePos", "uniform1i", 0);
		texturePos.bind(0);
		this.shader.uniform("textureDensity", "uniform1i", 1);
		textureDensity.bind(1);

		this.shader.uniform("uSize", "float", Config.PLANE_SIZE / 2);

		GL.draw(this.mesh);
	}


}

export default ViewParticles;
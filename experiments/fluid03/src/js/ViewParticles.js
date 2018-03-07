// ViewParticles.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/particles.vert';
import fs from 'shaders/particles.frag';
import Config from './Config';

class ViewParticles extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const cubeSize = Config.PLANE_SIZE/Config.NUM_PARTICLES * 1.5;
		this.mesh = alfrid.Geom.cube(cubeSize, cubeSize, cubeSize * 3.0);

		const uvs = [];
		const extras = [];
		const num = Config.NUM_PARTICLES;

		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				let u = i/num - 0.5/num;
				let v = j/num - 0.5/num;
				uvs.push([u, v]);
				extras.push([Math.random(), Math.random(), Math.random()])
			}
		}

		this.mesh.bufferInstance(uvs, 'aUVOffset');
		this.mesh.bufferInstance(extras, 'aExtra');
	}


	render(texturePos, textureVel, textureColor) {
		this.shader.bind();
		this.shader.uniform("texturePos", "uniform1i", 0);
		texturePos.bind(0);
		this.shader.uniform("textureVel", "uniform1i", 1);
		textureVel.bind(1);
		this.shader.uniform("textureColor", "uniform1i", 2);
		textureColor.bind(2);
		this.shader.uniform("uSize", "float", Config.PLANE_SIZE / 2);
		GL.draw(this.mesh);
	}


}

export default ViewParticles;
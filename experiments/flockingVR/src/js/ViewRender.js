// ViewRender.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/render.vert';
import fs from 'shaders/render.frag';
import Assets from './Assets';

class ViewRender extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random() * 0xFFF;

		this.shaderTest = new alfrid.GLShader();
	}


	_init() {
		let uvs    = [];
		let extras = [];

		let count        = 0;
		let numParticles = params.numParticles;
		let ux, uy;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				uvs.push([ux, uy]);
				extras.push([Math.random(), Math.random(), Math.random()])
			}
		}

		this.mesh = Assets.get('pyramid');
		this.mesh.bufferInstance(uvs, 'aUV');
		this.mesh.bufferInstance(extras, 'aExtra');
	}


	render(textureCurr, textureNext, p, textureExtra) {
		this.time += 0.1;
		this.shader.bind();

		this.shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		this.shader.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform('percent', 'float', p);
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform("uLightPos", "vec3", params.lightPosition);
		GL.draw(this.mesh);


		// this.shaderTest.bind();
		// GL.draw(this.mesh);
	}


}

export default ViewRender;
// ViewRender.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/render.vert';
import fs from 'shaders/render.frag';
import fsShadow from 'shaders/renderShadow.frag';

import Config from './Config';
const definesToString = function(defines) {
	let outStr = '';
	for (const def in defines) {
		if(defines[def]) {
			outStr += '#define ' + def + ' ' + defines[def] + '\n';	
		}
		
	}
	return outStr;
};

class ViewRender extends alfrid.View {
	
	constructor() {

		let usePCF = false;
		const defines = {
			'USE_PCF': GL.isMobile ? 1 : 1,
		}
		const defineStr = definesToString(defines);
		let _fs = `${defineStr}\n${fs}`;

		super(vs, _fs);
		this.time = Math.random() * 0xFFF;
		this.shaderShadow = new alfrid.GLShader(vs, fsShadow);
	}


	_init() {
		let positions    = [];
		let coords       = [];
		let indices      = []; 
		let count        = 0;
		let numParticles = Config.numParticles;
		let ux, uy;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				positions.push([ux, uy, 0]);
				indices.push(count);
				count ++;

			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);
	}


	renderShadow(textureCurr, textureNext, p, textureExtra) {
		this.time += 0.1;
		const shader = this.shaderShadow;
		shader.bind();

		shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		shader.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		shader.uniform('percent', 'float', p);
		shader.uniform('time', 'float', this.time);
		GL.draw(this.mesh);
	}


	render(textureCurr, textureNext, p, textureExtra, mShadowMatrix, mTextureDepth) {
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

		if(mShadowMatrix) {
			this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
			this.shader.uniform("textureDepth", "uniform1i", 3);
			mTextureDepth.bind(3);
		}
		GL.draw(this.mesh);
	}


}

export default ViewRender;
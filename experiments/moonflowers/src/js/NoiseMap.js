// NoiseMap.js

import alfrid, { GL } from 'alfrid';

import fs from 'shaders/noise.frag';

class NoiseMap {
	constructor() {
		const size = 1024;

		//	fbo
		const o = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
			type:GL.float
		};
		this._fbo = new alfrid.FrameBuffer(size, size, o, true, 2);

		//	mesh 
		this._mesh = alfrid.Geom.bigTriangle();

		//	shader
		this.shader = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fs);

		this.generate();

		gui.add(this, 'generate');
	}

	generate() {

		this._fbo.bind();
		GL.clear(0, 0, 0, 0);

		this.shader.bind();
		this.shader.uniform("uTime", "float", Math.random() * 0xFF);
		GL.draw(this._mesh);
		this._fbo.unbind();
	}


	get height() {
		return this._fbo.getTexture(0);
	}


	get normal() {
		return this._fbo.getTexture(1);
	}

}

export default NoiseMap;
// Noise.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import fs from 'shaders/noise.frag';

class Noise extends alfrid.FrameBuffer {
	constructor(mWidth=1024, mHeight=1024) {
		super(mWidth, mHeight);

		this._seed = Math.random() * 0xFF;
		this.shader = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.mesh = new alfrid.Geom.bigTriangle();
	}


	update() {
		this.bind();
		GL.clear(0, 0, 0, 0);
		this.shader.bind();
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime * Config.speed);
		this.shader.uniform("uSeed", "float", this._seed);
		this.shader.uniform("uNoiseScale", "float", Config.noise);
		GL.draw(this.mesh);
		this.unbind();
	}


	get texture() {
		return this.getTexture();
	}
}


export default Noise;
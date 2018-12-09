// Noise.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/noise.frag';

class Noise extends alfrid.FrameBuffer {
	constructor(mWidth=1024, mHeight=1024) {
		super(mWidth, mHeight, { type : GL.FLOAT });

		
		this.reset();
	}

	reset() {
		const seed = Math.random() * 0xFF;
		if(!this.shader) {
			this.shader = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fs);
			this.mesh = alfrid.Geom.bigTriangle();	
		}
		

		this.bind();
		GL.clear(0, 0, 0, 0);
		this.shader.bind();
		this.shader.uniform("uSeed", "float", seed);
		GL.draw(this.mesh);
		this.unbind();
	}

	get texture() {
		return this.getTexture();
	}
}


export default Noise;
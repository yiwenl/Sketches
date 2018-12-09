// Noise.js
import alfrid, { GL, FrameBuffer, GLShader} from 'alfrid';

import fs from 'shaders/noise.frag';

class Noise extends FrameBuffer {
	constructor() {
		let s = 1024;
		super(s, s, {type:GL.FLOAT});


		this.shader = new GLShader(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.mesh = alfrid.Geom.bigTriangle();

		this.update();

	}

	update() {

		this.bind();
		GL.clear(0, 0, 0, 0);
		this.shader.bind();
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime * 0.1);
		GL.draw(this.mesh);
		this.unbind();

	}


	get texture() {
		return this.getTexture();
	}
}

export default Noise;
// ParticleTexture.js

import alfrid, { FrameBuffer, GL } from 'alfrid';
import fs from 'shaders/normal.frag';

class ParticleTexture extends FrameBuffer {
	constructor() {
		const oSettings = {	minFilter:GL.LINEAR, magFilter:GL.LINEAR };
		const s = 32 * 2;
		super(s, s, oSettings);

		this._initMesh();
	}


	_initMesh() {
		const cameraOrtho = new alfrid.CameraOrtho();


		const size = 1;
		cameraOrtho.ortho(-size, size, -size, size);
		cameraOrtho.lookAt([0, 0, 3], [0, 0, 0]);
		const mesh = alfrid.Geom.sphere(1, 12);
		const shader = new alfrid.GLShader(null, fs);
		this.bind();
		// GL.clear(1, 0, 0, 1);
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(cameraOrtho);
		shader.bind();
		GL.draw(mesh);
		this.unbind();
	}


	get texture() {	return this.getTexture();	}
}

export default ParticleTexture;
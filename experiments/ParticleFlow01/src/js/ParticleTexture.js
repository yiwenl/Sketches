// ParticleTexture.js

import alfrid, { GL, FrameBuffer } from 'alfrid';

import fs from 'shaders/normal.frag';

class ParticleTexture extends FrameBuffer {

	constructor() {

		const s = 32;
		super(s, s, {minFilter:GL.LINEAR, magFilter:GL.LINEAR})


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
}

export default ParticleTexture;
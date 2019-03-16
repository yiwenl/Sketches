// getNormalTexture.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/normal.frag';

const getNormalTexture = () => {
	let s = 64;
	const fbo = new alfrid.FrameBuffer(s, s);
	const mesh = alfrid.Geom.sphere(1, 24);
	const shader = new alfrid.GLShader(null, fs);

	const camera = new alfrid.CameraPerspective();
	camera.setPerspective(45 * Math.PI / 180, 1, 0.1, 10);
	camera.lookAt([0, 0, 2.65], [0, 0, 0]);

	fbo.bind();
	GL.disable(GL.CULL_FACE);
	GL.clear(0, 0, 0, 0);
	GL.setMatrices(camera);

	shader.bind();
	GL.draw(mesh);

	fbo.unbind();

	return fbo.getTexture();
}


export default getNormalTexture;
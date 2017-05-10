// BatchSkybox.js

import Geom from '../Geom';
import GLShader from '../GLShader';
import Batch from '../Batch';

const vs = require('../shaders/skybox.vert');
const fs = require('../shaders/skybox.frag');


class BatchSkybox extends Batch {

	constructor(size = 20) {
		const mesh = Geom.skybox(size);
		const shader = new GLShader(vs, fs);

		super(mesh, shader);
	}

	draw(texture) {
		this.shader.bind();
		texture.bind(0);
		super.draw();
	}


}


export default BatchSkybox;
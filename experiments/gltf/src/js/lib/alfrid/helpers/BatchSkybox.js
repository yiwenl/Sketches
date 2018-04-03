// BatchSkybox.js

import Geom from '../Geom';
import GLShader from '../GLShader';
import Batch from '../Batch';

const vs = require('../glsl/skybox.vert');
const fs = require('../glsl/skybox.frag');


class BatchSkybox extends Batch {

	constructor(size = 20) {
		const geometry = Geom.skybox(size);
		const shader = new GLShader(vs, fs);

		super(geometry, shader);
	}

	draw(texture) {
		this.shader.bind();
		texture.bind(0);
		super.draw();
	}


}


export default BatchSkybox;
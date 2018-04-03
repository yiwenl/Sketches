// BatchSky.js

import Geom from '../Geom';
import GLShader from '../GLShader';
import Batch from '../Batch';

const vs = require('../glsl/sky.vert');
const fs = require('../glsl/copy.frag');


class BatchSky extends Batch {

	constructor(size = 50, seg = 24) {
		const geometry = Geom.sphere(size, seg, true);
		const shader = new GLShader(vs, fs);

		super(geometry, shader);
	}

	draw(texture) {
		this.shader.bind();
		texture.bind(0);
		super.draw();
	}
}

export default BatchSky;
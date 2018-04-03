// BatchBall.js

import Geom from '../Geom';
import GLShader from '../GLShader';
import Batch from '../Batch';

const vs = require('../glsl/general.vert');
const fs = require('../glsl/simpleColor.frag');

class BatchBall extends Batch {

	constructor() {
		const geometry = Geom.sphere(1, 24);
		const shader = new GLShader(vs, fs);
		super(geometry, shader);
	}


	draw(position = [0, 0, 0], scale = [1, 1, 1], color = [1, 1, 1], opacity = 1) {
		this.shader.bind();
		this.shader.uniform('position', 'uniform3fv', position);
		this.shader.uniform('scale', 'uniform3fv', scale);
		this.shader.uniform('color', 'uniform3fv', color);
		this.shader.uniform('opacity', 'uniform1f', opacity);
		super.draw();
	}

}

export default BatchBall;
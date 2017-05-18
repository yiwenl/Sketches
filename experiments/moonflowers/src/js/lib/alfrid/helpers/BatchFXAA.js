// BatchFXAA.js
import GL from '../GLTool';
import Geom from '../Geom';
import GLShader from '../GLShader';
import Batch from '../Batch';

const vs = require('../shaders/bigTriangle.vert');
const fs = require('../shaders/fxaa.frag');

class BatchFXAA extends Batch {

	constructor() {
		const mesh = Geom.bigTriangle();
		const shader = new GLShader(vs, fs);
		super(mesh, shader);

		shader.bind();
		shader.uniform('texture', 'uniform1i', 0);
	}


	draw(texture) {
		this.shader.bind();
		texture.bind(0);
		this.shader.uniform('uResolution', 'vec2', [1/GL.width, 1/GL.height]);
		super.draw();
	}

}

export default BatchFXAA;
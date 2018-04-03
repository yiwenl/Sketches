// BatchDotsPlane.js

import GL from '../GLTool';
import Geometry from '../Geometry';
import GLShader from '../GLShader';
import Batch from '../Batch';

const vs = require('../glsl/dotsPlane.vert');
const fs = require('../glsl/simpleColor.frag');

class BatchDotsPlane extends Batch {

	constructor() {
		const positions = [];
		const indices   = [];
		let index       = 0;
		const size      = 100;
		let i, j;

		for(i = -size; i < size; i += 1) {
			for(j = -size; j < size; j += 1) {
				positions.push([i, j, 0]);
				indices.push(index);
				index++;

				positions.push([i, 0, j]);
				indices.push(index);
				index++;
			}
		}
		
		const geometry     = new Geometry(GL.POINTS);
		geometry.bufferVertex(positions);
		geometry.bufferIndex(indices);
		
		const shader   = new GLShader(vs, fs);
		
		super(geometry, shader);
		
		this.color   = [1, 1, 1];
		this.opacity = 0.5;
	}


	draw() {
		this.shader.bind();
		this.shader.uniform('color', 'uniform3fv', this.color);
		this.shader.uniform('opacity', 'uniform1f', this.opacity);
		super.draw();
	}
}

export default BatchDotsPlane;
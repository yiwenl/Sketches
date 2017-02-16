// BatchDotsPlane.js

import GL from '../GLTool';
import Mesh from '../Mesh';
import GLShader from '../GLShader';
import Batch from '../Batch';

const vs = require('../shaders/dotsPlane.vert');
const fs = require('../shaders/simpleColor.frag');

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
		
		const mesh     = new Mesh(GL.POINTS);
		mesh.bufferVertex(positions);
		mesh.bufferIndex(indices);
		
		const shader   = new GLShader(vs, fs);
		
		super(mesh, shader);
		
		this.color   = [1, 1, 1];
		this.opacity = 0.5;
	}


	draw() {
		this.shader.bind();
		this.shader.uniform('color', 'uniform3fv', this.color);
		this.shader.uniform('opacity', 'uniform1f', this.opacity);
		// GL.draw(this.mesh);
		super.draw();
	}
}

export default BatchDotsPlane;
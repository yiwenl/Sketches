// BatchAxis.js

import GL from '../GLTool';
import Geometry from '../Geometry';
import GLShader from '../GLShader';
import Batch from '../Batch';

const vs = require('../glsl/axis.vert');
const fs = require('../glsl/axis.frag');


class BatchAxis extends Batch {

	constructor() {
		const positions = [];
		const colors = [];
		const indices = [0, 1, 2, 3, 4, 5];
		const r = 9999;

		positions.push([-r,  0,  0]);
		positions.push([r,  0,  0]);
		positions.push([0, -r,  0]);
		positions.push([0,  r,  0]);
		positions.push([0,  0, -r]);
		positions.push([0,  0,  r]);


		colors.push([1, 0, 0]);
		colors.push([1, 0, 0]);
		colors.push([0, 1, 0]);
		colors.push([0, 1, 0]);
		colors.push([0, 0, 1]);
		colors.push([0, 0, 1]);

		const mesh = new Geometry(GL.LINES);
		mesh.bufferVertex(positions);
		mesh.bufferIndex(indices);
		mesh.bufferData(colors, 'aColor', 3);

		const shader = new GLShader(vs, fs);

		super(mesh, shader);

	}


}


export default BatchAxis;
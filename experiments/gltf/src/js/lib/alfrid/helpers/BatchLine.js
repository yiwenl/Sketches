// BatchLine.js


import GL from '../GLTool';
import Geometry from '../Geometry';
import GLShader from '../GLShader';
import Batch from '../Batch';

const vs = require('../glsl/basic.vert');
const fs = require('../glsl/simpleColor.frag');



class BatchAxis extends Batch {

	constructor() {
		const positions = [];
		const indices = [0, 1];
		const coords = [[0, 0], [1, 1]];
		positions.push([0,  0,  0]);
		positions.push([0,  0,  0]);

		const geometry = new Geometry(GL.LINES);
		geometry.bufferVertex(positions);
		geometry.bufferTexCoord(coords);
		geometry.bufferIndex(indices);

		const shader = new GLShader(vs, fs);

		super(geometry, shader);
	}


	draw(mPositionA, mPositionB, color = [1, 1, 1], opacity = 1.0) {
		this._geometry.bufferVertex([mPositionA, mPositionB]);

		this._shader.bind();
		this._shader.uniform('color', 'vec3', color);
		this._shader.uniform('opacity', 'float', opacity);
		super.draw();
	}


}


export default BatchAxis;
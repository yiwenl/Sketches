// ViewLine.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/line.vert';
import fs from '../shaders/line.frag';

class ViewLine extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = new alfrid.Mesh(GL.LINES);
		const y = 10;
		const positions = [[0, 2, 0], [1, 2, 0]];
		const indices = [0, 1];

		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);
	}


	render(pos, target) {
		this.shader.bind();
		this.shader.uniform("uPos", "vec3", pos);
		this.shader.uniform("uTarget", "vec3", target);
		GL.draw(this.mesh);
	}


}

export default ViewLine;
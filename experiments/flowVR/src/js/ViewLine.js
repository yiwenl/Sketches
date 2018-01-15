// ViewLine.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/line.vert';

class ViewLine extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);

		this.color = [1, 0, 0];
		this.opacity = 1;

	}


	_init() {
		this.mesh = new alfrid.Mesh(GL.LINES);
		const positions = [
			[0, 0, -1],
			[ 1, 0, -1]
		];

		const indices = [0, 1];
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);
	}


	render(pointA = [0, 1, -1], pointB = [0, -1, -1]) {
		this.shader.bind();
		this.shader.uniform("color", "vec3", this.color);
		this.shader.uniform("opacity", "float", this.opacity);
		this.shader.uniform("uPointA", "vec3", pointA);
		this.shader.uniform("uPointB", "vec3", pointB);
		GL.draw(this.mesh);
	}


}

export default ViewLine;
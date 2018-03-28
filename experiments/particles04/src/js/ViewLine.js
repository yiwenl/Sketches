// ViewLine.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/line.vert';

class ViewLine extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		this.mesh = new alfrid.Mesh(GL.LINES);
		const position = [
			[0, 0, 0],
			[1, 0, 0],
		];

		this.mesh.bufferVertex(position);
		this.mesh.bufferIndex([0, 1]);
	}


	render(p0, p1, color=[1, 1, 1], opacity=1) {
		this.shader.bind();
		this.shader.uniform("uPoint0", "vec3", p0);
		this.shader.uniform("uPoint1", "vec3", p1);
		this.shader.uniform("color", "vec3", color);
		this.shader.uniform("opacity", "float", opacity);
		GL.draw(this.mesh);
	}


}

export default ViewLine;
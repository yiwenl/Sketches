// ViewLine.js


import alfrid, { GL } from 'alfrid';
import vs from 'shaders/line.vert';

class ViewLine extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		this.mesh = new alfrid.Mesh(GL.LINES);

		const positions = [
			[0, 0, 0],
			[1, 1, 1]
		]

		const indices = [0, 1]

		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);
	}


	render(mPos, mDir, mColor=[1, 1, 1]) {

		this.shader.bind();
		this.shader.uniform("uPosition", "vec3", mPos);
		this.shader.uniform("uDirection", "vec3", mDir);
		this.shader.uniform("color", "vec3", mColor);
		this.shader.uniform("opacity", "float", 1);
		GL.draw(this.mesh);
	}


}

export default ViewLine;
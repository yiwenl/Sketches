// ViewFloor.js

import alfrid, { GL } from 'alfrid';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const size = params.floorSize;
		this.mesh = alfrid.Geom.plane(size, size, 1, 'xz');
		this.mesh.generateFaces();

		this.shader.bind();

		const g = .0;
		this.shader.uniform("color", "vec3", [g, g, g]);
		this.shader.uniform("opacity", "float", .5);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
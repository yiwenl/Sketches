// ViewHitTest.js

import alfrid, { GL } from 'alfrid';

class ViewHitTest extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		let size = params.numCubes * params.cubeSize;
		this.mesh = alfrid.Geom.cube(size, size, size);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 0, 0]);
		this.shader.uniform("opacity", "float", .15);
		GL.draw(this.mesh);
	}


}

export default ViewHitTest;
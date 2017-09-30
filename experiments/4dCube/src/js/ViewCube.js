// ViewCube.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cube.vert';
import fs from 'shaders/cube.frag';

class ViewCube extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const size = 1;
		this.mesh = alfrid.Geom.cube(size, size, size);
		this.dimension = [size/2, size/2, size/2];
	}


	render(mPlane = [0.01, 1, 0, 999999]) {
		this.shader.bind();
		this.shader.uniform("uPlane", "vec4", mPlane);
		this.shader.uniform(params.light);
		GL.draw(this.mesh);
	}


}

export default ViewCube;
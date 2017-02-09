// ViewTest.js

import fs from '../shaders/test.frag';

import alfrid, { GL } from 'alfrid';

class ViewTest extends alfrid.View {
	
	constructor() {
		super();
		this.time = 0;
	}


	_init() {
		this.mesh = alfrid.Geom.plane(1, 1, 1);
	}


	render() {
		this.time += 0.01;
		this.shader.bind();

		this.shader.uniform("color", "vec3", [1, 0, 0]);
		this.shader.uniform("uTime", "float", this.time);
		this.shader.uniform("uv", "vec2", [1, 1]);
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		GL.draw(this.mesh);
	}


}

export default ViewTest;
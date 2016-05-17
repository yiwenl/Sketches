// ViewCube.js

import alfrid, { GL } from 'alfrid';
const vs = require('../shaders/cube.vert');
const fs = require('../shaders/cube.frag');

class ViewCube extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.position = [0, 1, 0];
		this.scale = [1, 1, 1];
		this.time = Math.random() * 0xFF;
	}


	_init() {
		const CUBE_SIZE = 1.0;
		this.mesh = alfrid.Geom.cube(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, true);
	}


	render(isFlip=false) {
		this.time += 0.01;
		this.position[1] = 1 + Math.cos(this.time) * .5;
		this.shader.bind();
		this.shader.uniform("uPosition", "vec3", this.position);
		this.shader.uniform("uScale", "vec3", this.scale);
		this.shader.uniform("uFlip", "float", (isFlip ? -1.0 : 1.0));
		GL.draw(this.mesh);
	}


}

export default ViewCube;
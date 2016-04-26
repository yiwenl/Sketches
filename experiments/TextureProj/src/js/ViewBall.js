// ViewBall.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
var glslify = require("glslify");
const vs = require('../shaders/pbr.vert');
const fs = require('../shaders/pbr.frag');

class ViewBall extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(1, 24 * 2, true);
	}


	render(shadowMatrix, texture, light) {
		this.shader.bind();
		this.shader.uniform("uPosition", "vec3", [0, 1, 0]);
		this.shader.uniform("uLight", "vec3", light);
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uShadowMatrix", "uniformMatrix4fv", shadowMatrix);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewBall;
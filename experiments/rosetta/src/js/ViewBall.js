// ViewBall.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewBall extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.generalVert, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(1, 30);
	}


	render(position, scale, color) {
		this.shader.bind();
		this.shader.uniform("position", "uniform3fv", position);
		this.shader.uniform("scale", "uniform3fv", scale);
		this.shader.uniform("color", "uniform3fv", color);
		this.shader.uniform("opacity", "uniform1f", 1);
		GL.draw(this.mesh);
	}


}

export default ViewBall;
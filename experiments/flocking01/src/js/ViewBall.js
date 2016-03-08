// ViewBall.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewBall extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.generalNormalVert, glslify('../shaders/sphere.frag'));
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(.24, 32, true);
	}


	render(pos = [0, 0, 0], scale = 1, color = [1, 0, 0], opacity = 1) {
		this.shader.bind();
		this.shader.uniform("position", "uniform3fv", pos);
		this.shader.uniform("scale", "uniform3fv", [scale, scale, scale]);
		this.shader.uniform("color", "uniform3fv", color);
		this.shader.uniform("opacity", "uniform1f", opacity);
		GL.draw(this.mesh);
	}


}

export default ViewBall;
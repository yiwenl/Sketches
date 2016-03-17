// ViewNoise.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewNoise extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, glslify('../shaders/noise.frag'));
		this.time = Math.random() * 10000;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render() {
		this.shader.bind();
		this.shader.uniform("time", "uniform1f", this.time);
		GL.draw(this.mesh);
	}


}

export default ViewNoise;
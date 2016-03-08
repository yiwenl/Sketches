// ViewSimulation.js

import alfrid from './libs/alfrid.js';

var glslify = require("glslify");

let GL = alfrid.GL;

class ViewSimulation extends alfrid.View {
	
	constructor() {
		let fs = glslify('../shaders/sim.frag');
		fs = fs.replace('{{BASE_RADIUS}}', params.baseRadius.toFixed(1));
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
		
	}

	_init() {
		console.log('init');

		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, touchRight=[0,0,0], pinchStrengthRight=0.0, touchLeft=[0,0,0], pinchStrengthLeft=0.0) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("time", "uniform1f", this.time);
		this.shader.uniform("skipCount", "uniform1f", params.skipCount);
		this.shader.uniform("uTouchRight", "uniform3fv", touchRight);
		this.shader.uniform("pinchStrengthRight", "uniform1f", pinchStrengthRight);
		this.shader.uniform("uTouchLeft", "uniform3fv", touchLeft);
		this.shader.uniform("pinchStrengthLeft", "uniform1f", pinchStrengthLeft);

		GL.draw(this.mesh);
	}
}


export default ViewSimulation;

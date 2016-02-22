// ViewSimulation.js

import alfrid from './libs/alfrid.js';

var glslify = require("glslify");

let GL = alfrid.GL;

class ViewSimulation extends alfrid.View {
	
	constructor() {
		let fs = glslify('../shaders/flocking.frag');
		fs = fs.replace('{{NUM_PARTICLES}}', params.numParticles.toFixed(1));
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
		
	}

	_init() {
		console.log('init');

		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(textureVel, texturePos, textureExtra, textureSpeed) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform("textureVel", "uniform1i", 0);
		textureVel.bind(0);
		this.shader.uniform("texturePos", "uniform1i", 1);
		texturePos.bind(1);
		this.shader.uniform("textureExtra", "uniform1i", 2);
		textureExtra.bind(2);
		this.shader.uniform("textureSpeed", "uniform1i", 3);
		textureSpeed.bind(3);

		this.shader.uniform("time", "uniform1f", this.time);

		GL.draw(this.mesh);
	}
}


export default ViewSimulation;

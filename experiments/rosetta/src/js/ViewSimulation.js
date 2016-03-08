// ViewSimulation.js

import alfrid from './libs/alfrid.js';

var glslify = require("glslify");

let GL = alfrid.GL;

class ViewSimulation extends alfrid.View {
	
	constructor(balls) {
		let fs = glslify('../shaders/sim.frag');
		fs = fs.replace('{{NUM_BALLS}}', balls.length);
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this._balls = balls;
		this.time = Math.random() * 0xFF;
		this._uniformArray = [];

		for(let i=0; i<balls.length; i++) {
			let b = balls[i];

			this._uniformArray.push(b.position[0]);
			this._uniformArray.push(b.position[1]);
			this._uniformArray.push(b.position[2]);
			this._uniformArray.push(b.scale);
		}
	}

	_init() {
		console.log('init');

		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("time", "uniform1f", this.time);
		this.shader.uniform("skipCount", "uniform1f", params.skipCount);
		this.shader.uniform("maxRange", "uniform1f", params.maxRange);
		this.shader.uniform("particleAvoidingForce", "uniform1f", params.particleAvoidingForce);
		this.shader.uniform("particleAvoidingDistance", "uniform1f", params.particleAvoidingDistance);
		this.shader.uniform("balls", "uniform4fv", this._uniformArray);
		GL.draw(this.mesh);
	}
}


export default ViewSimulation;

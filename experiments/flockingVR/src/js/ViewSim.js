// ViewSim.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/sim.frag';


class ViewSim extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);

		this.flocking = {
			lowThreshold:.3,
			highThreshold:.7,
			minRadius:4,
			maxSpeed:.2,
			minSpeed:.05
		}


		params.flocking = this.flocking;
	}


	render(textureVel, texturePos, textureExtra, mHit, mHitRadius, mHitVel) {
		// console.log(mHit, mHitRadius);

		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform(params.particles);
		this.shader.uniform(this.flocking);

		this.shader.uniform("uHit", "vec3", mHit);
		this.shader.uniform("uHitRadius", "float", mHitRadius);
		this.shader.uniform("uHitVel", "float", mHitVel);


		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);


		GL.draw(this.mesh);
	}


}

export default ViewSim;
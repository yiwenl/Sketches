// ViewSim.js

import alfrid, { GL } from 'alfrid';
const fsSim = require('../../shaders/flocking.frag');


class ViewSim extends alfrid.View {
	
	constructor() {
		const fs = fsSim.replace('{{NUM_PARTICLES}}', params.numParticles.toFixed(1));
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);
		this.shader.uniform('textureSpeed', 'uniform1i', 3);

		this.shader.uniform('range', 'uniform1f', params.range);
		this.shader.uniform('skipCount', 'uniform1f', params.skipCount);
		this.shader.uniform('minThreshold', 'uniform1f', params.minThreshold);
		this.shader.uniform('maxThreshold', 'uniform1f', params.maxThreshold);
		this.shader.uniform('speedScale', 'uniform1f', params.speed * params.skipCount);
	}


	render(textureVel, texturePos, textureExtra, textureSpeed) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);
		textureSpeed.bind(3);


		GL.draw(this.mesh);
	}


}

export default ViewSim;
// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
const fsSim = require('../shaders/sim.frag');


class ViewSim extends alfrid.View {
	
	constructor() {
		let fs = fsSim.replace('{{NUM_PARTICLES}}', params.numParticles + '.0');
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);

	}


	render(textureVel, texturePos, textureExtra, touch) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);
		this.shader.uniform("uTouch", "vec3", touch);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);


		GL.draw(this.mesh);
	}


}

export default ViewSim;
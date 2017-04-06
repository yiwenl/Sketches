// ViewSim.js

import alfrid from 'alfrid';
const GL = alfrid.GL;
const fsSim = require('../shaders/sim.frag');


class ViewSim extends alfrid.View {
	
	constructor() {
		const fs = fsSim.replace('${NUM}', params.numParticles);
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


	render(textureVel, texturePos, textureExtra, mouse) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', params.maxRadius);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);

		this.shader.uniform("uResolution", "vec2", [GL.width, GL.height]);
		this.shader.uniform("uMouse", "vec3", mouse);
		this.shader.uniform("uGravity", "float", params.gravity ? 0.05 : 0.0);
		this.shader.uniform("uPulling", "float", params.gravity ? 0 : 1.0);


		GL.draw(this.mesh);
	}


}

export default ViewSim;
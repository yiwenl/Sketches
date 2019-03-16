// ViewSim.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/sim.frag';
import fsFlocking from 'shaders/flocking.frag';
import Config from './Config';


class ViewSim extends alfrid.View {
	
	constructor() {
		const _fs = fsFlocking.replace('${NUM}', Config.numParticles)
		super(alfrid.ShaderLibs.bigTriangleVert, _fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();

		this.shader.bind();
		this.shader.uniform('textureVel', 'uniform1i', 0);
		this.shader.uniform('texturePos', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);

	}


	render(textureVel, texturePos, textureExtra) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', Config.maxRadius);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);


		this.shader.uniform(Config.flocking);


		GL.draw(this.mesh);
	}


}

export default ViewSim;
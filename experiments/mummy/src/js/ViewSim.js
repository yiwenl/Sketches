// ViewSim.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/sim.frag';
import Config from './Config';


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
		this.shader.uniform("textureDepth", "uniform1i", 3);
	}


	render(textureVel, texturePos, textureExtra, textureDepth, depthMatrix, mNose, mPreNose) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', Config.maxRadius * 0.75);
		this.shader.uniform("uDepthMatrix", "mat4", depthMatrix);
		this.shader.uniform("uNose", "vec3", mNose);
		this.shader.uniform("uPreNose", "vec3", mPreNose);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);
		textureDepth.bind(3);

		GL.draw(this.mesh);
	}


}

export default ViewSim;
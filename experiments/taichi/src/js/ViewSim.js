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
		this.shader.uniform("textureBg", "uniform1i", 3);
		this.shader.uniform("textureNeighbor", "uniform1i", 4);
		

	}


	render(textureVel, texturePos, textureExtra, textureNeighbor, textureBg) {
		this.time += .01;
		this.shader.bind();
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform('maxRadius', 'float', Config.maxRadius);
		this.shader.uniform('uRandomness', 'float', Config.randomness);
		textureVel.bind(0);
		texturePos.bind(1);
		textureExtra.bind(2);
		textureBg.bind(3);
		textureNeighbor.bind(4);

		GL.draw(this.mesh);
	}


}

export default ViewSim;
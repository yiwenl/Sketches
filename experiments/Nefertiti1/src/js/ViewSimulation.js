// ViewSimulation.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/sim.frag';

class ViewSimulation extends alfrid.View {
	
	constructor() {
		
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
		
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

		GL.draw(this.mesh);
	}
}


export default ViewSimulation;

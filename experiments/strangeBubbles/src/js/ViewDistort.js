// ViewDistort.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/distort.frag';

class ViewDistort extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(textureBg, textureMask) {
		this.shader.bind();

		this.shader.uniform("textureBg", "uniform1i", 0);
		textureBg.bind(0);
		this.shader.uniform("textureMask", "uniform1i", 1);
		textureMask.bind(1);

		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime * 0.35);

		GL.draw(this.mesh);
	}


}

export default ViewDistort;
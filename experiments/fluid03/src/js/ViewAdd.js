// ViewAdd.js

import alfrid, { GL } from 'alfrid';
import getMesh from './utils/getMesh';
import fs from 'shaders/sim.frag';
import Config from './Config';

class ViewAdd extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = getMesh();
	}


	render(texturePos, textureVel, textureExtra) {
		this.shader.bind();
		this.shader.uniform("texturePos", "uniform1i", 0);
		texturePos.bind(0);
		this.shader.uniform("textureVel", "uniform1i", 1);
		textureVel.bind(1);
		this.shader.uniform("textureExtra", "uniform1i", 2);
		textureExtra.bind(2);

		this.shader.uniform("uSize", "float", Config.PLANE_SIZE/2);
		GL.draw(this.mesh);
	}


}

export default ViewAdd;
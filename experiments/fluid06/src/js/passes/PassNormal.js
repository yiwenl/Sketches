// PassNormal.js

import alfrid, { GL } from 'alfrid';
import getMesh from '../utils/getMesh';
import fs from 'shaders/normal.frag';

class PassNormal extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = getMesh();
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("uCap", "float", params.cap);
		this.shader.uniform("uHeight", "float", params.height);
		GL.draw(this.mesh);
	}


}

export default PassNormal;
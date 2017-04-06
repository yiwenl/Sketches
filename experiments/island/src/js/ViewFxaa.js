// ViewFxaa.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/fxaa.frag';

class ViewFxaa extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("rtWidth", "float", GL.width);
		this.shader.uniform("rtHeight", "float", GL.height);
		GL.draw(this.mesh);
	}


}

export default ViewFxaa;
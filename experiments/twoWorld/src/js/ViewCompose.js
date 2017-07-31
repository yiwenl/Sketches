// ViewCompose.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/compose.frag';

class ViewCompose extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture0, texture1, textureMap) {
		this.shader.bind();
		this.shader.uniform("texture0", "uniform1i", 0);
		texture0.bind(0);
		this.shader.uniform("texture1", "uniform1i", 1);
		texture1.bind(1);
		this.shader.uniform("textureMap", "uniform1i", 2);
		textureMap.bind(2);
		GL.draw(this.mesh);
	}


}

export default ViewCompose;
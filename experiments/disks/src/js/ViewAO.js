// ViewAO.js

import alfrid, { GL } from 'alfrid';

const fs = require('../shaders/ssao.frag');

class ViewAO extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		
	}


	render(texture, textureDepth) {
		this.shader.bind();
		this.shader.uniform("textureWidth", "uniform1f", GL.width);
		this.shader.uniform("textureHeight", "uniform1f", GL.height);
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureDepth", "uniform1i", 1);
		textureDepth.bind(1);
		GL.draw(this.mesh);
	}


}

export default ViewAO;
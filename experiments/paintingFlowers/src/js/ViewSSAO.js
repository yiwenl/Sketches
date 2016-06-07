// ViewSSAO.js

import alfrid, { GL } from 'alfrid';

import fs from '../shaders/ssao.frag';

class ViewSSAO extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, textureDepth) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureDepth", "uniform1i", 1);
		textureDepth.bind(1);
		this.shader.uniform('textureWidth', 'float', GL.width);
		this.shader.uniform('textureHeight', 'float', GL.height);
		GL.draw(this.mesh);
	}

}

export default ViewSSAO;
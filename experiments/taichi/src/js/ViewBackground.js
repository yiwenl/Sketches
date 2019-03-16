// ViewBackground.js

import alfrid, { GL } from 'alfrid';

import fs from 'shaders/bg.frag';

class ViewBackground extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(textureMap, textureBg) {
		this.shader.bind();
		this.shader.uniform("textureMap", "uniform1i", 0);
		textureMap.bind(0);
		this.shader.uniform("textureBg", "uniform1i", 1);
		textureBg.bind(1);
		GL.draw(this.mesh);
	}


}

export default ViewBackground;
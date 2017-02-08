// ViewSky.js

import alfrid, { GL } from 'alfrid';

import fs from '../shaders/sky.frag';

class ViewSky extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.skyboxVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.skybox(20);
	}


	render(textureCurr, textureNext, offset) {
		this.shader.bind();

		this.shader.uniform("textureCurr", "uniform1i", 0);
		textureCurr.bind(0);

		this.shader.uniform("textureNext", "uniform1i", 1);
		textureNext.bind(1);

		this.shader.uniform("uOffset", "float", offset);
		GL.draw(this.mesh);
	}


}

export default ViewSky;
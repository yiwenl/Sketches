// ViewDome.js

import alfrid, { GL, Geom } from 'alfrid';

import vs from '../shaders/dome.vert';
import fs from '../shaders/dome.frag';

class ViewDome extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { terrainSize } = params;
		this.mesh = Geom.sphere(terrainSize * 0.75, 48, true);
	}


	render(textureCurr, textureNext) {
		this.shader.bind();
		this.shader.uniform("textureCurr", "uniform1i", 0);
		textureCurr.bind(0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		textureNext.bind(1);
		GL.draw(this.mesh);
	}


}

export default ViewDome;
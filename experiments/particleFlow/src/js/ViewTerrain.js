// ViewTerrain.js

import alfrid, { GL, Geom } from 'alfrid';

import vs from '../shaders/terrain.vert';
import fs from '../shaders/terrain.frag';

class ViewTerrain extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { terrainSize } = params;
		this.mesh = Geom.plane(terrainSize, terrainSize, 120, 'xz');
	}


	render(textureHeight, textureNormal) {
		this.shader.bind();
		this.shader.uniform("textureHeight", "uniform1i", 0);
		textureHeight.bind(0);
		this.shader.uniform("textureNormal", "uniform1i", 1);
		textureNormal.bind(1);
		this.shader.uniform("uMaxHeight", "float", params.maxHeight);
		GL.draw(this.mesh);
	}


}

export default ViewTerrain;
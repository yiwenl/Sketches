// ViewTerrain.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/terrain.vert';
import fs from '../shaders/terrain.frag';

class ViewTerrain extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		
	}


	_init() {
		const size = params.terrainSize;

		this.mesh = alfrid.Geom.plane(size, size, 120, 'xz');
		this._textureHeight = new alfrid.GLTexture(getAsset('height'));

		this.maxHeight = 4;
		gui.add(this,'maxHeight', 0, 10);
	}


	render() {
		this.shader.bind();

		this.shader.uniform("textureHeight", "uniform1i", 0);
		this._textureHeight.bind(0);
		this.shader.uniform("uMaxHeight", "float", this.maxHeight);
		this.shader.uniform("uClipY", "float", params.clipY);
		this.shader.uniform("uDir", "float", params.clipDir);

		GL.draw(this.mesh);
	}


}

export default ViewTerrain;
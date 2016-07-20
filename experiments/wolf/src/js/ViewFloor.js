// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/floor.vert';
import fs from '../shaders/floor.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const size = params.numTiles * params.grassRange * 2.0;
		this.mesh = alfrid.Geom.plane(size, size, 128, 'xz');
		this._texture = new alfrid.GLTexture(getAsset('ground'));
	}


	render(textureHeight) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this._texture.bind(0);
		this.shader.uniform("textureHeight", "uniform1i", 1);
		textureHeight.bind(1);
		this.shader.uniform('uFogOffset', 'uniform1f', params.fogOffset);
		this.shader.uniform('uFogColor', 'vec3', params.fogColor);
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
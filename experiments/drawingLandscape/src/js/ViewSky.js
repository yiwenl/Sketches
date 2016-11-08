// ViewSky.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/sky.vert';
import fs from '../shaders/sky.frag';

class ViewSky extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(params.terrainSize * 2, 24, true);
	}


	render(texture, mOffset) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("uFogOffset", "float", params.fogOffset);
		this.shader.uniform("uOffset", "float", mOffset);
		GL.draw(this.mesh);
	}

}

export default ViewSky;
// ViewStars.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/stars.vert';
import fs from '../shaders/stars.frag';

class ViewStars extends alfrid.View {
	
	constructor() {
		// super(vs, alfrid.ShaderLibs.copyFrag);
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(20, 24, true);
		this._texture = new alfrid.GLTexture(getAsset('starsmap'));
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this._texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewStars;
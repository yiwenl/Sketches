// ViewCompose.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/compose.vert';
import fs from 'shaders/compose.frag';

class ViewCompose extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewCompose;
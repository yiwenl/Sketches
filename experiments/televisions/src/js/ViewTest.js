// ViewTest.js

import vs from 'shaders/sky.vert';
import fs from 'shaders/sky.frag';

import alfrid, { GL } from 'alfrid';

class ViewTest extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		let size = 50, seg = 24
		this.mesh = alfrid.Geom.sphere(size, seg, true);
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewTest;
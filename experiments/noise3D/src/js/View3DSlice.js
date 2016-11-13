// View3DSlice.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/test.vert';
import fs from '../shaders/test.frag';

class View3DSlice extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = 0;
	}


	_init() {
		this.mesh = alfrid.Geom.plane(4, 4, 1);
		this.offset = 0;
		gui.add(this, 'offset', 0, 1);
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("uOffset", "float", this.offset);
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uNum", "float", 16);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default View3DSlice;
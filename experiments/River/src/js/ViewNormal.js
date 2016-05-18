// ViewNormal.js

import alfrid, { GL } from 'alfrid';
const fs = require('../shaders/normal.frag');

class ViewNormal extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		this.heightOffset = 0.15;
		// gui.add(this, 'heightOffset', 0, 0.5);
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uHeight", "float", this.heightOffset);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewNormal;
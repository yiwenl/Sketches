// ViewAddLife.js

import alfrid, { GL } from 'alfrid';
const frag = require('../shaders/addLife.frag');

class ViewAddLife extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, frag);
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

export default ViewAddLife;
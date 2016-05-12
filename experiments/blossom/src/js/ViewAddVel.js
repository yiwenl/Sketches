// ViewAddVel.js

import alfrid from 'alfrid';

const frag = require("../shaders/addvel.frag");

let GL = alfrid.GL;

class ViewAddVel extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, frag);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texturePos, textureVel) {
		this.shader.bind();

		this.shader.uniform("texturePos", "uniform1i", 0);
		texturePos.bind(0);

		this.shader.uniform("textureVel", "uniform1i", 1);
		textureVel.bind(1);

		GL.draw(this.mesh);
	}


}

export default ViewAddVel;
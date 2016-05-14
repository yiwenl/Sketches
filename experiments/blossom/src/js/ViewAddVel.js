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


	render(texturePos, textureVel, textureLife, textureInit) {
		this.shader.bind();

		this.shader.uniform("texturePos", "uniform1i", 0);
		texturePos.bind(0);

		this.shader.uniform("textureVel", "uniform1i", 1);
		textureVel.bind(1);

		this.shader.uniform("textureLife", "uniform1i", 2);
		textureLife.bind(2);

		this.shader.uniform("textureInit", "uniform1i", 3);
		textureInit.bind(3);

		this.shader.uniform("flyThreshold", "float", params.flyThreshold);

		GL.draw(this.mesh);
	}


}

export default ViewAddVel;
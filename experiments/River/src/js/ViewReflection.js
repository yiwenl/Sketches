// ViewReflection.js

import alfrid , { GL } from 'alfrid';
const fs = require('../shaders/reflection.frag');

class ViewReflection extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(textureReflection, textureNormal) {
		this.shader.bind();

		this.shader.uniform("textureReflection", "uniform1i", 0);
		textureReflection.bind(0);

		this.shader.uniform("textureNormal", "uniform1i", 1);
		textureNormal.bind(1);
		
		GL.draw(this.mesh);
	}


}

export default ViewReflection;
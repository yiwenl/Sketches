// ViewReflection.js

import alfrid , { GL } from 'alfrid';
const fs = require('../shaders/reflection.frag');

class ViewReflection extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.reflectionStrength = 0.02;
		// gui.add(this, 'reflectionStrength', 0.001, 0.02);
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

		this.shader.uniform("uReflectionStrength", "float", this.reflectionStrength);
		
		GL.draw(this.mesh);
	}


}

export default ViewReflection;
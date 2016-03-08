// ViewBloom.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewBloom extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, glslify('../shaders/bloom.frag'));
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, textureBlur) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureBlur", "uniform1i", 1);
		textureBlur.bind(1);
		this.shader.uniform("multiply", "uniform1f", params.multiply);
		GL.draw(this.mesh);
	}


}

export default ViewBloom;
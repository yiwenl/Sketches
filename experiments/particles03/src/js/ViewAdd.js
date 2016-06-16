// ViewAdd.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/add.frag';

class ViewAdd extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
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
		GL.draw(this.mesh);
	}


}

export default ViewAdd;
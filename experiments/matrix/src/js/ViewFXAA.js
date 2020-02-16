// ViewFXAA.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/fxaa.frag';

class ViewFXAA extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("uResolution", "vec2", [1/GL.width, 1/GL.height]);
		GL.draw(this.mesh);
	}


}

export default ViewFXAA;
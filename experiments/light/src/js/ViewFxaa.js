// ViewFxaa.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import fs from '../shaders/fxaa.frag';

class ViewFxaa extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, textureBloom) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureBloom", "uniform1i", 1);
		textureBloom.bind(1);

		this.shader.uniform("uResolution", "vec2", [1/GL.width, 1/GL.height]);
		this.shader.uniform("uBloomStrength", "float", Config.bloomStrength);
		GL.draw(this.mesh);
	}


}

export default ViewFxaa;
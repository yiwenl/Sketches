// ViewChroma.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/chroma.frag';

class ViewChroma extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture) {
		this.time += 0.01;
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("resolution", "vec2", [GL.width, GL.height]);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewChroma;
// ViewDrawingBg.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/drawing.frag';

class ViewDrawingBg extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, mSaturation) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uSaturation", "float", mSaturation);
		texture.bind(0);
		GL.draw(this.mesh);
	}

}

export default ViewDrawingBg;
// ViewAO.js

import alfrid, { GL } from 'alfrid';

import fs from '../shaders/ssao.frag';

class ViewAO extends alfrid.View {
	
	constructor() {
		let samples = params.highSetting ? 12 : 6;
		let rings = params.highSetting ? 8 : 3;
		let _fs = fs.replace('${SAMPLES}', samples);
		_fs = _fs.replace('${RINGS}', rings);
		super(alfrid.ShaderLibs.bigTriangleVert, _fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, width, height) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureWidth", "float", width);
		this.shader.uniform("textureHeight", "float", height);
		GL.draw(this.mesh);
	}


}

export default ViewAO;
// ViewAO.js

import alfrid, { GL } from 'alfrid';

import fs from '../shaders/ssao.frag';

class ViewAO extends alfrid.View {
	
	constructor(mesh) {
		let samples = params.highSetting ? 12 : 6;
		let rings = params.highSetting ? 8 : 3;
		let _fs = fs.replace('${SAMPLES}', samples);
		_fs = _fs.replace('${RINGS}', rings);
		super(alfrid.ShaderLibs.bigTriangleVert, _fs);

		this.mesh = mesh;
	}


	_init() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
	}


	render(texture, width, height) {
		this.shader.bind();
		texture.bind(0);

		this.shader.uniform("textureWidth", "float", width);
		this.shader.uniform("textureHeight", "float", height);
		GL.draw(this.mesh);
	}


}

export default ViewAO;
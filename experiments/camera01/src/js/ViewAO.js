// ViewAO.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/ssao.frag';

class ViewAO extends alfrid.View {
	
	constructor() {
		const samples = 12;
		const rings = 8;
		let _fs = fs.replace('${SAMPLES}', samples);
		_fs = _fs.replace('${RINGS}', rings);
		super(alfrid.ShaderLibs.bigTriangleVert, _fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, width, height) {
		this.shader.bind();
		texture.bind(0);

		this.shader.uniform('textureWidth', 'float', width);
		this.shader.uniform('textureHeight', 'float', height);
		GL.draw(this.mesh);
	}



}

export default ViewAO;
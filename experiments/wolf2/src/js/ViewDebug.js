// ViewDebug.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/debug.vert';

class ViewDebug extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.copyFrag);
	}


	_init() {
		const { terrainSize } = params;
		this.mesh = alfrid.Geom.plane(terrainSize, terrainSize, 125, 'xz');
	}


	render(texture) {
		const { maxHeight } = params;
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("uMaxHeight", "float", maxHeight);
		GL.draw(this.mesh);
	}


}

export default ViewDebug;
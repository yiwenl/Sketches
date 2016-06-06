// ViewSky.js

import alfrid, { GL } from 'alfrid';

class ViewSky extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.copyFrag);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(30, 24, true);
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}

}

export default ViewSky;
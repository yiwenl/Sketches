// ViewSky.js

import alfrid, {GL} from 'alfrid';
const vs = require('../shaders/basic.vert');
const fs = require('../shaders/sky.frag');

class ViewSky extends alfrid.View {
	
	constructor() {
		// super(vs, alfrid.ShaderLibs.copyFrag);
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(15, 24, true, true);
		this.shader.bind();
		this.shader.uniform("position", "vec3", [0, 0, 0]);
		this.shader.uniform("scale", "vec3", [1, 1, 1]);
		this.shader.uniform("texture", "uniform1i", 0);
	}


	render(texture, isFlipping=false) {
		this.shader.bind();
		texture.bind(0);
		this.shader.uniform("uFlip", "float", isFlipping ? -1.0 : 1.0);
		this.shader.uniform("uGlobalTime", "float", params.globalTime+0.5);
		GL.draw(this.mesh);
	}


}

export default ViewSky;
// ViewSkybox.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewSkybox extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/skybox.vert'), glslify('../shaders/skybox.frag'));
	}


	_init() {
		this.mesh             = alfrid.Geom.skybox(35);
		this.meshWire 		  = alfrid.Geom.skybox(35, false, GL.LINES);
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);
		GL.draw(params.showWires ? this.meshWire : this.mesh);
	}


}

export default ViewSkybox;
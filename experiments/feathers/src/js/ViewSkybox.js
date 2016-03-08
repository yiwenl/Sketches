// ViewSkybox.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewSkybox extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/skybox.vert'), glslify('../shaders/skybox.frag'));
	}


	_init() {
		this.mesh             = alfrid.Geom.skybox(15);
		this.meshWire		  = alfrid.Geom.skybox(15, false, GL.LINES);
	}


	render(textureRad) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);
		textureRad.bind(0);
		GL.draw(params.showWires ? this.meshWire : this.mesh);
	}


}

export default ViewSkybox;
// ViewSphere.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewSphere extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/touchSphere.vert'), glslify('../shaders/touchSphere.frag'));
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(1, 24*3); 
	}


	render(position=[0,1,0],scale=1,lightPosition=[0, 1, 0], pinchStrength=0.0) {
		this.shader.bind();
		this.shader.uniform("position", "uniform3fv", position);
		this.shader.uniform("scale", "uniform3fv", [scale, scale, scale]);

		this.shader.uniform("uLightPos", "uniform3fv", lightPosition);
		this.shader.uniform("pinchStrength", "uniform1f", pinchStrength);
		GL.draw(this.mesh);
	}


}

export default ViewSphere;
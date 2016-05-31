// ViewGodRay.js

import alfrid, { GL } from 'alfrid';

const fs = require('../shaders/godray.frag');

class ViewGodRay extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.count = 0;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture) {
		// this.count += .03;
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("time", "uniform1f", this.count);
		this.shader.uniform("density", "uniform1f", params.density);
		this.shader.uniform("weight", "uniform1f", params.weight);
		this.shader.uniform("decay", "uniform1f", params.decay);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewGodRay;
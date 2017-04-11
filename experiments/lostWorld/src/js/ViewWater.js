// ViewWater.js

import alfrid, { GL } from 'alfrid';

import vs from '../shaders/water.vert';
import fs from '../shaders/water.frag';

class ViewWater extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.plane(params.worldSize, params.worldSize, 1, 'xz');

		this.shader.bind();
		this.shader.uniform("textureReflection", "uniform1i", 0);
		this.shader.uniform("uSeaLevel", "float", 0);
	}


	render(textureReflection) {
		this.shader.bind();
		textureReflection.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewWater;
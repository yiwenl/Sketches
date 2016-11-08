// ViewWater.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/water.vert';
import fs from '../shaders/water.frag';

class ViewWater extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const size = params.terrainSize;

		this.mesh = alfrid.Geom.plane(size, size, 1, 'xz');
	}


	render(textureReflection, textureRefraction) {
		this.shader.bind();

		this.shader.uniform("textureReflection", "uniform1i", 0);
		textureReflection.bind(0);

		this.shader.uniform("textureRefraction", "uniform1i", 1);
		textureRefraction.bind(1);

		this.shader.uniform("uSeaLevel", "float", params.seaLevel);
		GL.draw(this.mesh);
	}


}

export default ViewWater;
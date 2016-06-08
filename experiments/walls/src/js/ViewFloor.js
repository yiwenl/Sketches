// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/pbr.vert';
import fs from '../shaders/pbr.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const size = 100;
		this.mesh = alfrid.Geom.cube(size, .1, size);
		this.baseColor = [1, 1, .95];
	}


	render() {
		this.shader.bind();

		this.shader.uniform('color', 'vec3', this.baseColor);
		this.shader.uniform('opacity', 'float', 1.0);

		GL.draw(this.mesh);
	}

}

export default ViewFloor;
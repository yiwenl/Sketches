// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/floor.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.generalVert, fs);
	}


	_init() {
		const s = 30;
		this.mesh = alfrid.Geom.plane(s, s, 1, 'xz');

		this.shader.bind();
		this.shader.uniform("position", "vec3", [0, -8, 0]);
		this.shader.uniform("scale", "vec3", [1, 1, 1]);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
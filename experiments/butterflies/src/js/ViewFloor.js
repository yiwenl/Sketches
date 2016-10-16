// ViewFloor.js

import alfrid, { GL, Geom } from 'alfrid';
import fs from '../shaders/floor.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.generalVert, fs);
		this.position = [0, -20, 0];
	}


	_init() {
		const size = 80;
		this.mesh = Geom.plane(size, size, 1, 'xz');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("position", "vec3", this.position);
		this.shader.uniform("scale", "vec3", [1, 1, 1]);
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
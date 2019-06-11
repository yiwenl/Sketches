// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/floor.vert';
import fs from 'shaders/floor.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = 10;
		this.mesh = alfrid.Geom.plane(s, s, 1, 'xz');
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
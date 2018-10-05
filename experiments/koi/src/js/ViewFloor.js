// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/floor.vert';
import fs from 'shaders/floor.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { maxRadius } = Config;
		this.mesh = alfrid.Geom.plane(maxRadius, maxRadius, 1, 'xz');
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
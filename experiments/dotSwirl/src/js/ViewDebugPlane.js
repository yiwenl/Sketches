// ViewDebugPlane.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/plane.vert';
import fs from 'shaders/plane.frag';

class ViewDebugPlane extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		let s = 3;
		this.mesh = alfrid.Geom.plane(s, s, 100, 'xz');
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewDebugPlane;
// ViewSphere.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/sphere.vert';
import fs from 'shaders/sphere.frag';

class ViewSphere extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {

		const s = 10;
		this.mesh = alfrid.Geom.sphere(s, 48, true);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uThreshold", "float", Config.threshold);
		GL.draw(this.mesh);
	}


}

export default ViewSphere;
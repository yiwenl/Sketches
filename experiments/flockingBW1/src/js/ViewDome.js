// ViewDome.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/depth.vert';
import fs from '../shaders/depth.frag';

class ViewDome extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(11, 30, true);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewDome;
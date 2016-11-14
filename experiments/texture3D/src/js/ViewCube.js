// ViewCube.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/cube.vert';
import fs from '../shaders/cube.frag';

class ViewCube extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.cube(1, 1, 1);
		this.mesh = alfrid.Geom.sphere(0.5, 48);
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("uNum", "float", 16.0);
		GL.draw(this.mesh);
	}


}

export default ViewCube;
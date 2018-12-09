// ViewDome.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/dome.vert';
import fs from 'shaders/floor.frag';


class ViewDome extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		let s = 30 * 0.75;
		this.mesh = alfrid.Geom.sphere(s, 12, true);
	}


	render(colors0, colors1, p=0) {

		let colorSet0 = [];
		let colorSet1 = [];

		for(let i=0; i<4; i++) {
			colorSet0 = colorSet0.concat(colors0[i]);
			colorSet1 = colorSet1.concat(colors1[i]);
		}
		
		this.shader.bind();
		this.shader.uniform("uPercent", "float", p);
		this.shader.uniform("uColorSet0", "vec3", colorSet0);
		this.shader.uniform("uColorSet1", "vec3", colorSet1);
		GL.draw(this.mesh);
	}


}

export default ViewDome;
// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/floor.vert';
import fs from 'shaders/floor.frag';

import getColorTheme from 'get-color-themes';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = 50;
		this.size = 50;
		this.mesh = alfrid.Geom.plane(s, s, 100, 'xz');
		
	}


	render(texture, colors0, colors1, p=0) {

		let colorSet0 = [];
		let colorSet1 = [];

		for(let i=0; i<4; i++) {
			colorSet0 = colorSet0.concat(colors0[i]);
			colorSet1 = colorSet1.concat(colors1[i]);
		}
		
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("uPercent", "float", p);
		this.shader.uniform("uColorSet0", "vec3", colorSet0);
		this.shader.uniform("uColorSet1", "vec3", colorSet1);
		this.shader.uniform("uSize", "float", this.size/2);
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
// ViewMask.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/mask.frag';
import vs from 'shaders/mask.vert';
import Config from './Config';

class ViewMask extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = window.ARDisplay ? Config.bubbleScale : 1;
		this.mesh = alfrid.Geom.sphere(2 * s, 24 * 4);
	}


	render(mDir, mScale) {
		this.shader.bind();
		this.shader.uniform("uLookDir", "vec3", mDir);
		this.shader.uniform("uScale", "float", mScale);
		GL.draw(this.mesh);
	}


}

export default ViewMask;
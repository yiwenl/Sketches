// ViewFloor.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/floor.vert';
import fs from 'shaders/floor.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.mtx = mat4.create();

		mat4.translate(this.mtx, this.mtx, vec3.fromValues(0, -10, 0));
	}


	_init() {
		const s = 25;
		this.mesh = alfrid.Geom.plane(s, s, 1, 'xz');
	}


	render(mShadowMatrix, textureDepth) {
		GL.pushMatrix();
		GL.rotate(this.mtx);
		this.shader.bind();
		this.shader.uniform("textureDepth", "uniform1i", 0);
		textureDepth.bind(0);
		this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		GL.draw(this.mesh);
		GL.popMatrix();
	}


}

export default ViewFloor;
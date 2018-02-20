// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/floor.vert';
import fs from 'shaders/floor.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this.mtxModel = mat4.create();
		mat4.translate(this.mtxModel, this.mtxModel, vec3.fromValues(0, -6, 0));
	}


	_init() {
		const s = 25 * 2;
		this.mesh = alfrid.Geom.plane(s, s, 1, 'xz');
	}


	render(mShadowMatrix, mDepthTexture) {
		GL.pushMatrix();
		GL.rotate(this.mtxModel);
		this.shader.bind();
		this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		this.shader.uniform("uMapSize", "vec2", [1024, 1024]);
		this.shader.uniform("textureDepth", "uniform1i", 0);
		mDepthTexture.bind(0);
		GL.draw(this.mesh);
		GL.popMatrix();
	}


}

export default ViewFloor;
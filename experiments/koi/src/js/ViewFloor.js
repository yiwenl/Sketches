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


	render(mShadowMatrix, mTextureDepth) {
		this.shader.bind();
		this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		this.shader.uniform("textureDepth", "uniform1i", 0);
		mTextureDepth.bind(0);
		
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
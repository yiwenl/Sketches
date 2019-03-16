// ViewTracing.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/fog.frag';

class ViewTracing extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(mLightPos, mLightDir, mMtxShadow) {
		this.shader.bind();
		this.shader.uniform("uLightPos", "vec3", mLightPos);
		this.shader.uniform("uLightDir", "vec3", mLightDir);
		GL.draw(this.mesh);
	}


}

export default ViewTracing;
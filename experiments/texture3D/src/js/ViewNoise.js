// ViewNoise.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/noise.frag';
class ViewNoise extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		this._noiseScale = 2.0;
	}


	render(mSeed = 0.0) {
		this.shader.bind();
		this.shader.uniform("uNoiseScale", "float", this._noiseScale);
		this.shader.uniform("uSeed", "float", mSeed);
		GL.draw(this.mesh);
	}


}

export default ViewNoise;
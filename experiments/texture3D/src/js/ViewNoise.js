// ViewNoise.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/noise.frag';
import Config from './Config';

class ViewNoise extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(mIndex) {
		this.shader.bind();
		this.shader.uniform("uIndex", "float", mIndex);
		this.shader.uniform("uNoiseScale", "float", Config.noiseScale);
		GL.draw(this.mesh);
	}


}

export default ViewNoise;
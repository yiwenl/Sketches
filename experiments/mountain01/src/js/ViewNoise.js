// ViewNoise.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import fs from 'shaders/noise.frag';

class ViewNoise extends alfrid.View {
	
	constructor() {
		const _fs = fs.replace('${NUM_OCTAVES}', Config.NUM_OCTAVES);
		super(alfrid.ShaderLibs.bigTriangleVert, _fs);

		this.seed = Math.random() * 10.0;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uSeed", "float", this.seed);
		this.shader.uniform("uNoiseScale", "float", Config.noiseScale);
		this.shader.uniform("uNormalScale", "float", Config.normalScale);
		GL.draw(this.mesh);
	}


}

export default ViewNoise;
// ViewNoise2.js

import alfrid, { GL } from 'alfrid';

import fs from 'shaders/noise2.frag';

class ViewNoise2 extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);

		this._seed = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uSeed", "float", this._seed);
		GL.draw(this.mesh);
	}


}

export default ViewNoise2;
// ViewNoise.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/noise.frag';

class ViewNoise extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render() {
		this.time -= 0.005;
		this.shader.bind();
		this.shader.uniform("uTime", "float", this.time);
		GL.draw(this.mesh);
	}


}

export default ViewNoise;
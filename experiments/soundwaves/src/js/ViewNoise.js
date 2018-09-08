// ViewNoise.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import fs from 'shaders/noise.frag';

class ViewNoise extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime * 0.2 * Config.speed);
		GL.draw(this.mesh);
	}


}

export default ViewNoise;
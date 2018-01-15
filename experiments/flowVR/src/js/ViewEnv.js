// ViewEnv.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/env.vert';
import fs from 'shaders/env.frag';
import Assets from './Assets';

class ViewEnv extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.skyboxVert, fs);
	}


	_init() {
		const seg = 24;
		this.mesh = alfrid.Geom.sphere(50, seg, true);
		this.texture = Assets.get('inner_org');

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);	
	}


	render() {
		this.shader.bind();
		this.texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewEnv;
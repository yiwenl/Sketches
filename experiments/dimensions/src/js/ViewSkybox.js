// ViewSkybox.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/skybox.vert';
import fs from 'shaders/skybox.frag';
import Assets from './Assets';

class ViewSkybox extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.skybox(1);

		this.textureInner = Assets.get('inner_org');
		this.textureOuter = Assets.get('outer_org');

		this.radius = new alfrid.EaseNumber(1);
	}


	render(hit = [0,0,-1]) {

		let v = vec3.clone(hit);
		vec3.normalize(v, v);
		vec3.scale(v, v, params.skyboxSize);

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uHit", "vec3", v);
		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		//	inner
		this.shader.uniform("uSize", "float", params.skyboxSize);
		this.shader.uniform("uHoleRadius", "float", this.radius.value);
		this.textureInner.bind(0);
		GL.draw(this.mesh);

		//	outer
		this.shader.uniform("uSize", "float", params.skyboxSize+0.1);
		this.shader.uniform("uHoleRadius", "float", 0);
		this.textureOuter.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewSkybox;
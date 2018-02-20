// ViewDome.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/dome.vert';
import fs from 'shaders/dome.frag';
import Assets from './Assets';

class ViewDome extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(1, 24, true);

		this.textureInner = Assets.get('inner');
		this.textureOuter = Assets.get('outer');

		console.log('this.textureInne', this.textureInner);

		this.radius = new alfrid.EaseNumber(0);
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
		this.shader.uniform('uExposure', 'uniform1f', params.exposure * 5);
		this.shader.uniform("uSize", "float", params.skyboxSize+0.1);
		this.shader.uniform("uHoleRadius", "float", 0);
		this.textureOuter.bind(0);
		GL.draw(this.mesh);

		GL.draw(this.mesh);
	}


}

export default ViewDome;
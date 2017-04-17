// ViewStatue.js

import alfrid, { GL } from 'alfrid';

import Assets from './Assets';

import vs from '../shaders/pbr.vert';
import fs from '../shaders/statue.frag';

class ViewStatue extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = Assets.get('statue');

		this.roughness = .1;
		this.specular = 1;
		this.metallic = .5;

		const s = 0.025;
		this.baseColor = [s, s, s];
	}


	render(textureRad, textureIrr, textureAO) {
		this.time += 0.001;
		this.shader.bind();

		this.shader.uniform('uAoMap', 'uniform1i', 0);
		this.shader.uniform('uNoiseMap', 'uniform1i', 1);
		this.shader.uniform('uRadianceMap', 'uniform1i', 2);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 3);
		textureAO.bind(0);
		Assets.get('noise').bind(1);
		textureRad.bind(2);
		textureIrr.bind(3);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		this.shader.uniform("uTime", "float", this.time);

		GL.draw(this.mesh);
	}


}

export default ViewStatue;
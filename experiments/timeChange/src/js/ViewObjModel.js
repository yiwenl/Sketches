// ViewObjModel.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

import vs from '../shaders/pbr.vert';
import fs from '../shaders/pbr.frag';

class ViewObjModel extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = Assets.get('model');

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
		
		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);
	}


	render(textureRadCurr, textureIrrCurr, textureRadNext, textureIrrNext, textureAO, offset) {
		this.shader.bind();

		this.shader.uniform('uAoMap', 'uniform1i', 0);
		this.shader.uniform('uRadianceMapCurr', 'uniform1i', 1);
		this.shader.uniform('uIrradianceMapCurr', 'uniform1i', 2);
		this.shader.uniform('uRadianceMapNext', 'uniform1i', 3);
		this.shader.uniform('uIrradianceMapNext', 'uniform1i', 4);

		textureAO.bind(0);
		textureRadCurr.bind(1);
		textureIrrCurr.bind(2);
		textureRadNext.bind(3);
		textureIrrNext.bind(4);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);
		this.shader.uniform("uOffset", "float", offset);

		GL.draw(this.mesh);
	}


}

export default ViewObjModel;
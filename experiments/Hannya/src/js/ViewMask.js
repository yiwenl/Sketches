// ViewMask.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

import vs from '../shaders/pbr.vert';
import fs from '../shaders/mask.frag';

class ViewMask extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = Assets.get('mask');

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];

		this._textureColor = Assets.get('mask_albedo');
		this._textureNormal = Assets.get('mask_normal');
		this._textureMaps = Assets.get('maps');

		this.shader.bind();

		this.shader.uniform('uColorMap', 'uniform1i', 0);
		this.shader.uniform('uNormalMap', 'uniform1i', 4);
		this.shader.uniform('uCombinedMap', 'uniform1i', 5);

		this.shader.uniform('uRadianceMap', 'uniform1i', 6);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 7);
		this.shader.uniform('uReflectionMap', 'uniform1i', 8);
	}


	render(textureRad, textureIrr, textureReflection) {

		this.shader.bind();

		this._textureColor.bind(0);
		this._textureNormal.bind(4);
		this._textureMaps.bind(5);
		
		textureRad.bind(6);
		textureIrr.bind(7);
		textureReflection.bind(8);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewMask;
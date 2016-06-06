// ViewTerrain.js

import alfrid, { GL } from 'alfrid';

import vs from '../shaders/terrain.vert';
import fs from '../shaders/terrain.frag';


class ViewTerrain extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		let strObj = getAsset('objTerrain');
		this.mesh = alfrid.ObjLoader.parse(strObj);

		this.roughness = .95;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [.18, .18, .18];
	}


	render(textureRad, textureIrr, textureAO) {
		if(!this.mesh) {
			return;
		}
		this.shader.bind();

		this.shader.uniform('uAoMap', 'uniform1i', 0);
		this.shader.uniform('uRadianceMap', 'uniform1i', 1);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		textureAO.bind(0);
		textureRad.bind(1);
		textureIrr.bind(2);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform("uPosition", "vec3", [0, 0, 0]);
		const scale = 8;
		this.shader.uniform("uScale", "vec3", [scale, .01, scale]);
		this.shader.uniform("uFogOffset", "float", params.fogOffset);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewTerrain;
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
		this.specular = .5;
		this.metallic = 0;

		this.baseColor = [77/255, 76/255, 73/255];
		this.level = -0.125;

		// const f = gui.addFolder('Terrain');
		// f.add(this, 'roughness', 0, 1);
		// f.add(this, 'specular', 0, 1);
		// f.add(this, 'metallic', 0, 1);
		// f.addColor(this, 'baseColor');
		// f.add(this, 'level', -0.2, -0.1).onChange(()=> {
		// 	console.log(this.level);
		// });
		// f.open();
	}


	render(textureRad, textureIrr, textureAO, textureNoise, mOffset) {
		if(!this.mesh) {
			return;
		}
		this.shader.bind();

		this.shader.uniform('uAoMap', 'uniform1i', 0);
		this.shader.uniform('uNoiseMap', 'uniform1i', 1);
		this.shader.uniform('uRadianceMap', 'uniform1i', 2);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 3);
		textureAO.bind(0);
		textureNoise.bind(1);
		textureRad.bind(2);
		textureIrr.bind(3);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform("uPosition", "vec3", [0, this.level - 0.2, 0]);
		const scale = .3;
		this.shader.uniform("uScale", "vec3", [scale, scale * 0.1, scale]);
		this.shader.uniform("uFogOffset", "float", params.fogOffset);
		this.shader.uniform("uFogDensity", "float", params.fogDensity);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);
		this.shader.uniform("uOffset", "float", mOffset);

		GL.draw(this.mesh);
	}


}

export default ViewTerrain;
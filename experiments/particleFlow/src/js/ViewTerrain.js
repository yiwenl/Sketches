// ViewTerrain.js

import alfrid, { GL, Geom } from 'alfrid';

import vs from '../shaders/terrain.vert';
import fs from '../shaders/terrain.frag';

class ViewTerrain extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { terrainSize } = params;
		this.mesh = Geom.plane(terrainSize, terrainSize, 120, 'xz');

		this.roughness = .9;
		this.specular = 0;
		this.metallic = 0;
		const br = 1.2;
		this.baseColor = [37/255 * br, 40/255 * br, 75/255 * br];
		
		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);
	}


	render(textureHeight, textureNormal, textureRad, textureIrr, textureNoise) {
		this.shader.bind();
		this.shader.uniform("textureHeight", "uniform1i", 0);
		textureHeight.bind(0);
		this.shader.uniform("textureNormal", "uniform1i", 1);
		textureNormal.bind(1);

		this.shader.uniform("textureNoise", "uniform1i", 2);
		textureNoise.bind(2);
		this.shader.uniform("uMaxHeight", "float", params.maxHeight);

		this.shader.uniform('uRadianceMap', 'uniform1i', 3);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 4);
		textureRad.bind(3);
		textureIrr.bind(4);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewTerrain;
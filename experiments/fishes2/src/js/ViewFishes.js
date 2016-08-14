// ViewFishes.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/fish.vert';
import fs from '../shaders/pbr.frag';

class ViewFishes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		let strObj = getAsset('objModel');
		this.mesh = alfrid.ObjLoader.parse(strObj);

		const numParticles = params.numParticles;
		const uv = [];

		for(let j=0; j<numParticles; j++) {
			for(let i=0; i<numParticles; i++) {
				uv.push([i/numParticles, j/numParticles]);
			}
		}


		this.mesh.bufferInstance(uv, 'aUV');

		this.roughness = 0;
		this.specular = 1;
		this.metallic = 1;
		this.baseColor = [1, 1, 1];

		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);
	}


	render(textureRad, textureIrr, textureCurr, textureNext, p, textureExtra) {
		this.shader.bind();
		this.shader.uniform("textureCurr", "uniform1i", 0);
		textureCurr.bind(0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		textureNext.bind(1);
		this.shader.uniform("textureExtra", "uniform1i", 2);
		textureExtra.bind(2);
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

		this.shader.uniform("percent", "float", p);

		GL.draw(this.mesh);
	}


}

export default ViewFishes;
// ViewFog.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/fog.vert';
import fs from 'shaders/fog.frag';

class ViewFog extends alfrid.View {
	
	constructor() {
		const _fs = fs.replace('${NUM}', Config.numLights);
		super(vs, _fs);
	}


	_init() {
		const s = Config.floorSize;
		this.size = Config.floorSize;
		this.mesh = alfrid.Geom.plane(s, s, 1);


		const { numSlices } = Config;
		const posOffset = [];

		for(let i=0; i<numSlices; i++) {
			let z = (i/numSlices - 0.5) * s;
			posOffset.push([0, 3.5, z]);
		}

		this.mesh.bufferInstance(posOffset, 'aPosOffset');
	}


	setupLights(mLights) {
		const lightOrigin = [];
		const lightDir = [];
		const lightColor = [];

		mLights.forEach( light => {
			lightOrigin.push(light.origin[0], light.origin[1], light.origin[2]);
			lightDir.push(light.dir[0], light.dir[1], light.dir[2]);
			lightColor.push(light.color[0], light.color[1], light.color[2]);
		});

		this.shader.bind();
		this.shader.uniform("uLightOrigin", "vec3", lightOrigin);
		this.shader.uniform("uLightDir", "vec3", lightDir);
		this.shader.uniform("uLightColor", "vec3", lightColor);
	}


	render(mOrigin, mDir, texture0, texture1, percent) {
		GL.enableAdditiveBlending();
		this.shader.bind();
		this.shader.uniform("uOrigin", "vec3", mOrigin);
		this.shader.uniform("uDir", "vec3", mDir);
		this.shader.uniform("uNumSlices", "float", Config.numSlices);

		this.shader.uniform("uSize", "float", this.size * 0.5);
		this.shader.uniform("uNum", "float", Config.noiseNum);
		this.shader.uniform("uOffset", "float", Config.fogOffset);

		this.shader.uniform("texture0", "uniform1i", 0);
		texture0.bind(0);
		this.shader.uniform("texture1", "uniform1i", 1);
		texture1.bind(1);
		this.shader.uniform("uPercent", "float", percent);
		this.shader.uniform("uLightIntensity", "float", Config.lightIntensity);

		GL.draw(this.mesh);
		GL.enableAlphaBlending();
	}


}

export default ViewFog;
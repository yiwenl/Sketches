// ViewMist.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/mist.vert';
import fs from 'shaders/mist.frag';

class ViewMist extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		let s = Config.floorSize * 2;
		let h = 4;
		this.mesh = alfrid.Geom.plane(s, h, 1);

		const { numSlices } = Config;
		let positions = [];

		for(let i=0; i<numSlices; i++) {
			// let z = -s/2 + i/numSlices * s;
			let z = i/numSlices * s * 0.15;
			positions.push([Math.random(), h/2, z]);
		}

		this.mesh.bufferInstance(positions, 'aPosOffset');
	}


	render(mShadowMatrix, mDepthTexture, texture0, texture1, percent) {
		GL.enableAdditiveBlending();
		this.shader.bind();
		this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		this.shader.uniform("textureDepth", "uniform1i", 0);
		mDepthTexture.bind(0);

		this.shader.uniform("texture0", "uniform1i", 1);
		texture0.bind(1);
		this.shader.uniform("texture1", "uniform1i", 2);
		texture1.bind(2);
		this.shader.uniform("uPercent", "float", percent);
		this.shader.uniform("uSize", "float", Config.floorSize);

		this.shader.uniform("uNum", "float", Config.noiseNum);
		this.shader.uniform("uNumSlices", "float", Config.numSlices);
		this.shader.uniform("uOffset", "float", Config.misOffset);

		GL.draw(this.mesh);
		GL.enableAlphaBlending();
	}


}

export default ViewMist;

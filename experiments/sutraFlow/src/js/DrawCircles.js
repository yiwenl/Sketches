// DrawCircles.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/circles.vert'
import fs from 'shaders/circles.frag'

class DrawCircles extends alfrid.Draw {
	constructor() {
		super();

		const uvOffsets = [];
		const { numParticles } = Config;
		for (let i = 0; i < numParticles; i++) {
			for (let j = 0; j < numParticles; j++) {
				uvOffsets.push([i/numParticles + 0.5/numParticles, j/numParticles + 0.5/numParticles]);
			}
		}


		this.useProgram(vs, fs)
			.setMesh(alfrid.Geom.plane(1, 1, 1))
			.bufferInstance(uvOffsets, 'aUVOffset')
	}


	draw(texturePos, textureMap) {
		this.uniformTexture('texturePos', texturePos, 0);
		this.uniformTexture('textureMap', textureMap, 1);
		super.draw();
	}


}

export default DrawCircles;
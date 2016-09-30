// ViewDebugDots.js

import alfrid, { GL } from 'alfrid';

import vs from '../shaders/dots.vert';
import fs from '../shaders/dots.frag';

class ViewDebugDots extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this._traveled = 0;
		this.test = new alfrid.EaseNumber(0);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(.5, 12);

		let { terrainSize } = params;
		terrainSize /= 2;
		const num = 10;
		const positions = [];
		let sx = -terrainSize;
		let sz = -terrainSize;
		for(let i=0; i<=num; i++) {
			for(let j=0; j<=num; j++) {
				let x = sx + i/num * terrainSize * 2;
				let z = sz + j/num * terrainSize * 2;
				positions.push([x, 0, z]);
			}
		}

		this.mesh.bufferInstance(positions, 'aPosOffset');
	}


	render(texture) {
		const { maxHeight, terrainSize, speed, noiseScale, isOne } = params;
		const totalDist = terrainSize / noiseScale;
		this._traveled += speed;
		this.test.value = params.isOne ? 1 : 0;


		const distForward = this._traveled * totalDist;

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("uMaxHeight", "float", maxHeight);
		this.shader.uniform("uTerrainSize", "float", terrainSize/2);
		this.shader.uniform("uDistForward", "float", distForward);
		GL.draw(this.mesh);
	}


}

export default ViewDebugDots;
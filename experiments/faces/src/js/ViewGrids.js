// ViewGrids.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/grids.vert';
import fs from 'shaders/grids.frag';

class ViewGrids extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const posOffsets = [];
		const uv = [];
		const size = .5;
		this.mesh = alfrid.Geom.cube(size, size, size);

		const xNum = 32 * 1/size;
		const yNum = xNum * 48/64;

		console.log(xNum * yNum);

		for(let i=0; i<xNum; i++) {
			for(let j=0; j<yNum; j++) {
				let x = (-xNum/2 + i) * size;
				let y = (-yNum/2 + j) * size;

				posOffsets.push([x, y, 0]);

				uv.push([i/xNum, j/yNum]);
			}
		}

		this.mesh.bufferInstance(posOffsets, 'aPosOffset');
		this.mesh.bufferInstance(uv, 'aUV');
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewGrids;
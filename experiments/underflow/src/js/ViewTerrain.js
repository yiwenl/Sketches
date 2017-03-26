// ViewTerrain.js

import alfrid, { GL } from 'alfrid';

import vs from '../shaders/terrain.vert';
import fs from '../shaders/terrain.frag';

const numGrid = 5;

class ViewTerrain extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const num = 100;
		const size = 6;
		this.mesh = alfrid.Geom.plane(size, size, num, 'xz');


		const posOffset = [];
		const uvOffset = [];
		const t = 1/numGrid;
		const sx = -size * numGrid/2 + size/2;
		const sz = size * numGrid/2 - size/2;
		
		for(let i=0; i<numGrid; i++) {
			for(let j=0; j<numGrid; j++) {
				let x = sx + size * i;
				let z = sz - size * j;

				let u = t * i;
				let v = t * j;

				posOffset.push([x, z]);
				uvOffset.push([u, v]);
			}
		}


		this.mesh.bufferInstance(posOffset, 'aPosOffset');
		this.mesh.bufferInstance(uvOffset, 'aUVOffset');

		this.shader.bind();
		this.shader.uniform("uNumGrid", "float", 1/numGrid);
		this.shader.uniform("textureHeight", "uniform1i", 0);
		this.shader.uniform("textureNormal", "uniform1i", 1);
	}


	render(textureHeight, textureNormal) {
		this.shader.bind();
		textureHeight.bind(0);
		textureNormal.bind(1);

		this.shader.uniform(params.globalUniforms);

		GL.draw(this.mesh);
	}


}

export default ViewTerrain;
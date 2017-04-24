// ViewPlanes.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/planes.vert';
import fs from 'shaders/planes.frag';

class ViewPlanes extends alfrid.View {
	
	constructor() {
		super(vs);
	}


	_init() {
		const s = 1.0;
		this.mesh = alfrid.Geom.plane(s, s * .2, params.inner.numSeg);

		let uvs = [];
		let numParticles = params.numParticles;
		let ux, uy;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				uvs.push([ux, uy]);
			}
		}

		this.mesh.bufferInstance(uvs, 'aUV');
	}


	render(maps) {
		this.shader.bind();
		maps.forEach((t, i)=> {
			this.shader.uniform(`texture${i}`, "uniform1i", i);
			t.getTexture().bind(i);
		});

		GL.draw(this.mesh);
	}


}

export default ViewPlanes;
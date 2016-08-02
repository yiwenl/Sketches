// ViewFishes.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/fishes.vert';
import fs from '../shaders/fishes.frag';

class ViewFishes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		let strObj = getAsset('obj');
		this.mesh = alfrid.ObjLoader.parse(strObj);

		const numParticles = params.numParticles;
		const uv = [];

		for(let j=0; j<numParticles; j++) {
			for(let i=0; i<numParticles; i++) {
				uv.push([i/numParticles, j/numParticles]);
			}
		}

		this.mesh.bufferInstance(uv, 'aUV');
		this.shader.bind();
		this.shader.uniform('textureCurr', 'uniform1i', 0);
		this.shader.uniform('textureNext', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);
	}


	render(textureCurr, textureNext, p, textureExtra) {
		this.shader.bind();
		textureCurr.bind(0);
		textureNext.bind(1);
		textureExtra.bind(2);
		this.shader.uniform('percent', 'float', p);

		GL.draw(this.mesh);
	}


}

export default ViewFishes;
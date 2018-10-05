// ViewFish.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';
import vs from 'shaders/fishes.vert';
import fs from 'shaders/fishes.frag';

class ViewFish extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const uvs = [];

		const { numParticles:num } = Config;

		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				let uv = [i/num * 0.5, j/num];
				uvs.push(uv);
			}
		}

		this.mesh = Assets.get('fish');
		this.mesh.bufferInstance(uvs, 'aUV');
	}


	render(texture, textureExtra) {
		this.shader.bind();
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime);

		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureExtra", "uniform1i", 1);
		textureExtra.bind(1);

		this.shader.uniform(Config.fish);
		GL.draw(this.mesh);
	}


}

export default ViewFish;
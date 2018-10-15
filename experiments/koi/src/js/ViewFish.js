// ViewFish.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';
import vs from 'shaders/fishes.vert';
import fs from 'shaders/fishes.frag';


var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewFish extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const uvs = [];
		const uvOffset = [];

		const { numParticles:num } = Config;
		const n = 4;
		const r = 0.1;

		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				let uv = [i/num * 0.5, j/num];
				uvs.push(uv);

				let t = Math.floor(Math.random() * 16);
				let u = (t % n) / n;
				let v = Math.floor(t / n) / n;

				u += random(-r, r);
				v += random(-r, r);

				uvOffset.push([u, v, Math.random()]);
			}
		}

		this.mesh = Assets.get('fish');
		this.mesh.bufferInstance(uvs, 'aUV');
		this.mesh.bufferInstance(uvOffset, 'aUVOffset');

		this.textureSkin = Assets.get('ink');
		this.textureSkin.minFilter = this.textureSkin.magFilter = GL.LINEAR_MIPMAP_NEAREST;
		this.textureSkin.wrapS = this.textureSkin.wrapT = GL.MIRRORED_REPEAT;
	}


	render(texture, textureExtra) {
		this.shader.bind();
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime);

		this.shader.uniform("uUseTexture", "float", Config.useTexture ? 1.0 : 0.0);

		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureExtra", "uniform1i", 1);
		textureExtra.bind(1);

		this.shader.uniform("textureSkin", "uniform1i", 2);
		this.textureSkin.bind(2);

		this.shader.uniform(Config.fish);
		GL.draw(this.mesh);
	}


}

export default ViewFish;
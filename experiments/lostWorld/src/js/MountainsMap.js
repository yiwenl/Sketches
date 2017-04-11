// MountainsMap.js

import { GL, GLShader, Geom, ShaderLibs, FrameBuffer } from 'alfrid';
import fs from '../shaders/heightMap.frag';

const MAP_SIZE = 256/2;
const NUM_MAPS = 4;

var random = function(min, max) { return min + Math.random() * (max - min);	}

class MountainsMap {
	constructor() {

		this.shader = new GLShader(ShaderLibs.bigTriangleVert, fs);
		this.mesh = Geom.bigTriangle();
		const fboSize = MAP_SIZE * NUM_MAPS;
		this._fbo = new FrameBuffer(fboSize, fboSize, {}, true);

	}


	generate() {
		this._fbo.bind();
		GL.clear(0, 0, 0, 0);

		this.shader.bind();

		let x, y;
		for(let i=0; i<NUM_MAPS; i++) {
			for(let j=0; j<NUM_MAPS; j++) {
				x = i * MAP_SIZE;
				y = j * MAP_SIZE;

				GL.viewport(x, y, MAP_SIZE, MAP_SIZE);

				this.shader.uniform("uSeed", "float", Math.random() * 0xFF);
				this.shader.uniform("uNoiseScale", "float", random(1, 2));
				GL.draw(this.mesh);
			}
		}
		this._fbo.unbind();
	}


	getTexture() {
		return this._fbo.getTexture();
	}

	getNormalTexture() {
		return this._fbo.getTexture(1);
	}

}


export default MountainsMap;
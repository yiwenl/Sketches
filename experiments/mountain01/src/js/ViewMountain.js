// ViewMountain.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/mountain.vert';
import fs from 'shaders/mountain.frag';

class ViewMountain extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.tileSize = Config.mountainSize / Config.NUM_TILE;
		this.mesh = alfrid.Geom.plane(this.tileSize, this.tileSize, 100, 'xz');
	}


	render(textureHeight, textureNormal, mCameraPos) {
		const { NUM_TILE } = Config;
		const uvScale = 1.0 / NUM_TILE;
		let u, v, x, y;


		this.shader.bind();

		this.shader.uniform("uCameraPos", "vec3", mCameraPos);
		this.shader.uniform("uHeight", "float", Config.height);
		this.shader.uniform("uLight", "vec3", Config.lightPos);

		this.shader.uniform("textureHeight", "uniform1i", 0);
		textureHeight.bind(0);

		this.shader.uniform("textureNormal", "uniform1i", 1);
		textureNormal.bind(1);
		


		for(let i=0; i<NUM_TILE; i++) {
			for(let j=0; j<NUM_TILE; j++) {

				x = i * this.tileSize - Config.mountainSize /2 + this.tileSize/2;
				y = -j * this.tileSize + Config.mountainSize/2 - this.tileSize/2;

				u = i/NUM_TILE;
				v = j/NUM_TILE;

				this.shader.uniform("uUVOffset", "vec3", [u, v, uvScale]);
				this.shader.uniform("uPosOffset", "vec2", [x, y]);

				GL.draw(this.mesh);
			}
		}

		
	}


}

export default ViewMountain;
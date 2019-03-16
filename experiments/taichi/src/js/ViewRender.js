// ViewRender.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/render.vert';
import fs from 'shaders/render.frag';
import Config from './Config';
import Assets from './Assets';

class ViewRender extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random() * 0xFFF;
	}


	_init() {
		let positions    = [];
		let coords       = [];
		let indices      = []; 
		let count        = 0;
		let numParticles = Config.numParticles;
		let ux, uy;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				positions.push([ux, uy, 0]);
				indices.push(count);
				count ++;

			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);


		const pickColorMap = () => {
			let index = Math.floor(Math.random() * 7 + 1);
			this.textureColor = Assets.get(`0${index}`);	
			console.log(`0${index}`);
		}

		pickColorMap();

		window.addEventListener('keydown', (e) => {
			if(e.keyCode === 32) {
				pickColorMap();
			}
		})
		
	}


	render(textureCurr, textureNext, p, textureExtra, mShadowMatrix, mTextureDepth, textureParticle, textureBg, posLight, textureNeighbor) {
		this.time += 0.1;
		this.shader.bind();

		this.shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		this.shader.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		this.shader.uniform("textureParticle", "uniform1i", 4);
		textureParticle.bind(4);

		this.shader.uniform("textureBg", "uniform1i", 5);
		textureBg.bind(5);

		this.shader.uniform("textureColor", "uniform1i", 6);
		this.textureColor.bind(6);

		this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		this.shader.uniform("textureDepth", "uniform1i", 3);
		mTextureDepth.bind(3);

		this.shader.uniform("textureNeighbor", "uniform1i", 7);
		textureNeighbor.bind(7);

		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform('percent', 'float', p);
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform("uPosLight", "vec3", posLight);
		GL.draw(this.mesh);
	}


}

export default ViewRender;
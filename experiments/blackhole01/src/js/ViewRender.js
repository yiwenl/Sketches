// ViewRender.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/render.vert';
import fs from 'shaders/render.frag';
import Config from './Config';
import FlowControl from './FlowControl';

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
	}


	render(textureCurr, textureExtra, mShadowMatrix, mTextureDepth, textureParticle, textureOrg, textureBg1, textureBg2) {
		this.time += 0.1;
		this.shader.bind();

		this.shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shader.uniform('textureExtra', 'uniform1i', 1);
		textureExtra.bind(1);

		this.shader.uniform("textureParticle", "uniform1i", 2);
		textureParticle.bind(2);

		this.shader.uniform("textureDepth", "uniform1i", 3);
		mTextureDepth.bind(3);

		this.shader.uniform("textureOrg", "uniform1i", 4);
		textureOrg.bind(4);

		this.shader.uniform("textureBg1", "uniform1i", 5);
		textureBg1.bind(5);

		this.shader.uniform("textureBg2", "uniform1i", 6);
		textureBg2.bind(6);


		this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform('uContrast', 'float', Config.particleContrast);
		this.shader.uniform('time', 'float', this.time);
		this.shader.uniform("uOpacity", "float", FlowControl.bgOpeningOffset);
		this.shader.uniform("uOffsetFadeOut", "float", Config.fadeOutOffset);
		this.shader.uniform("uLight", "vec3", [Config.lightX, Config.lightY, Config.lightZ]);

		const s = Config.centred ? (1/3) : 1;
		this.shader.uniform("uParticleScale", "float", Config.particleScale * s);

		GL.draw(this.mesh);
	}

}

export default ViewRender;
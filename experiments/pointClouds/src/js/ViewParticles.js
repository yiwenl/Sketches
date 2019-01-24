// ViewParticles.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import Assets from './Assets';
import vs from 'shaders/particles.vert';
import fs from 'shaders/particles.frag';

class ViewParticles extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { numParticles } = Config;
		const positions = [];
		const uvs = [];
		const indices = [];
		let count = 0;


		const getUV = () => {
			let u = Math.floor(Math.random() * 4) * 0.25;
			return [u, Math.random()];
		}


		let gap = 1 / numParticles;

		for(let i=0; i<numParticles; i++) {
			for(let j=0; j<numParticles; j++) {
				positions.push([i/numParticles + Math.random() * gap, j/numParticles + Math.random() * gap, Math.random()]);
				uvs.push(getUV());
				indices.push(count);

				count ++;
			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

		this.textureParticle = Assets.get('brushes');
		this.textureParticle.minFilter = this.textureParticle.magFilter = GL.LINEAR;
	}


	render(texturePos, textureColor) {
		this.shader.bind();
		this.shader.uniform("texturePos", "uniform1i", 0);
		texturePos.bind(0);
		this.shader.uniform("textureColor", "uniform1i", 1);
		textureColor.bind(1);
		this.shader.uniform("textureParticle", "uniform1i", 2);
		this.textureParticle.bind(2);
		this.shader.uniform("uViewport", "vec2", [GL.width, GL.height]);

		this.shader.uniform("uParticleScale", "float", Config.particleScale);
		GL.draw(this.mesh);
	}


}

export default ViewParticles;
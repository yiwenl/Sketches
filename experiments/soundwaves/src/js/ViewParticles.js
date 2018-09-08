// ViewParticles.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/particles.vert';
import fs from 'shaders/particles.frag';

class ViewParticles extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { numParticles } = Config;
		const positions = [];
		const normals = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const r = 30;

		for(let i=0; i<numParticles; i++) {
			for(let j=0; j<numParticles; j++) {
				let rr = Math.random() * 0.5;
				let a = Math.random() * Math.PI * 2.0;


				let u = (Math.cos(a) * rr + 1.0) * 0.5;
				let v = (Math.sin(a) * rr + 1.0) * 0.5;

				let x = (u - 0.5) * r;
				let z = (v - 0.5) * r;

				positions.push([x, 0, z]);
				uvs.push([u, v]);
				normals.push([Math.random(), Math.random(), Math.random()]);
				indices.push(count);

				count ++;
			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

	}


	render(textureParticle, textureHeight, textureNoise) {
		this.shader.bind();
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime);
		this.shader.uniform("uViewport", "vec2", [GL.width, GL.height]);
		this.shader.uniform("textureParticle", "uniform1i", 0);
		textureParticle.bind(0);
		this.shader.uniform("textureHeight", "uniform1i", 1);
		textureHeight.bind(1);
		this.shader.uniform("textureNoise", "uniform1i", 2);
		textureNoise.bind(2);
		this.shader.uniform("uWaveHeight", "float", Config.waveHeight);

		let light = [Config.lightX, Config.lightY, Config.lightZ];
		this.shader.uniform("uLight", "vec3", light);

		for(let i=0; i<Config.numCopies; i++) {
			let angle = i/Config.numCopies * Math.PI * 2.0;
			this.shader.uniform("uTheta", "float", angle);
			GL.draw(this.mesh);	
		}
		
	}


}

export default ViewParticles;
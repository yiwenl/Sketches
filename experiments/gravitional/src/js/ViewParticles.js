// ViewParticles.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/particles.vert';
import fs from 'shaders/particles.frag';
import fsShadow from 'shaders/shadow.frag';

class ViewParticles extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.shaderShadow = new alfrid.GLShader(vs, fsShadow);
	}


	_init() {
		const { numParticles } = Config;
		const positions = [];
		const normals = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const r = Config.range;

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


	render(textureParticle, textureHeight, textureNoise, mShadowMatrix, mTextureDepth, mLightPos) {
		this.shader.bind();
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime);
		this.shader.uniform("uViewport", "vec2", [GL.width, GL.height]);
		this.shader.uniform("textureParticle", "uniform1i", 0);
		textureParticle.bind(0);
		this.shader.uniform("textureHeight", "uniform1i", 1);
		textureHeight.bind(1);
		this.shader.uniform("textureNoise", "uniform1i", 2);
		textureNoise.bind(2);

		this.shader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		this.shader.uniform("textureDepth", "uniform1i", 3);
		mTextureDepth.bind(3);

		this.shader.uniform("uWaveHeight", "float", Config.waveHeight);
		this.shader.uniform("uRange", "float", Config.range);

		this.shader.uniform("uLightPos", "vec3", mLightPos);
		this.shader.uniform("uCameraPos", "vec3", GL.camera.position);

		for(let i=0; i<Config.numCopies; i++) {
			let angle = i/Config.numCopies * Math.PI * 2.0;
			this.shader.uniform("uTheta", "float", angle);
			GL.draw(this.mesh);	
		}
		
	}


	renderShadow(textureParticle, textureHeight, textureNoise) {
		const shader = this.shaderShadow;
		shader.bind();
		shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime);
		shader.uniform("uViewport", "vec2", [GL.width, GL.height]);
		shader.uniform("textureParticle", "uniform1i", 0);
		textureParticle.bind(0);
		shader.uniform("textureHeight", "uniform1i", 1);
		textureHeight.bind(1);
		shader.uniform("textureNoise", "uniform1i", 2);
		textureNoise.bind(2);
		shader.uniform("uWaveHeight", "float", Config.waveHeight);
		shader.uniform("uRange", "float", Config.range);

		for(let i=0; i<Config.numCopies; i++) {
			let angle = i/Config.numCopies * Math.PI * 2.0;
			shader.uniform("uTheta", "float", angle);
			GL.draw(this.mesh);	
		}
		
	}


}

export default ViewParticles;
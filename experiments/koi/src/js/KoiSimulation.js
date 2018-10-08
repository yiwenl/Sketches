// KoiSimulation.js

import alfrid, { GL, CameraOrtho } from 'alfrid';
import { FboPingPong } from './utils';
import Config from './Config';

import vsSave from 'shaders/save.vert';
import fsSave from 'shaders/save.frag';

import fsSim from 'shaders/sim.frag';
import fsFlock from 'shaders/flocking.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class KoiSimulation {
	constructor() {
		const { numParticles } = Config;

		//	INIT FRAME BUFFERS
		this._fbo = new FboPingPong(numParticles * 2, numParticles, {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		});

		
		this._saveFishPosition();
		this._saveExtraInfo();
	}


	_saveFishPosition() {
		const { numParticles:num, maxRadius } = Config;

		const positions = [];
		const extras = [];
		const uvs = [];
		const indices = [];
		let count = 0;
		const r = maxRadius * 0.25;

		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				let uv;
				let color;

				//	save position
				uv = [i/num * 0.5, j/num];
				color = [random(-r, r), -1.5, random(-r, r)];
				positions.push(color);
				uvs.push(uv);
				indices.push(count);
				count++;


				//	save velocity
				uv = [i/num * 0.5 + 0.5, j/num];
				color = [0, 0, 0];
				positions.push(color);
				uvs.push(uv);
				indices.push(count);
				count++;

			}
		}

		const meshSave = new alfrid.Mesh(GL.POINTS);
		meshSave.bufferVertex(positions);
		meshSave.bufferTexCoord(uvs);
		meshSave.bufferIndex(indices);

		const shaderSave = new alfrid.GLShader(vsSave, fsSave);

		const cameraOrtho = new CameraOrtho();

		this._fbo.read.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(cameraOrtho);
		shaderSave.bind();
		GL.draw(meshSave);
		this._fbo.read.unbind();

		this._fbo.write.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(cameraOrtho);
		shaderSave.bind();
		GL.draw(meshSave);
		this._fbo.write.unbind();


		//	simulation 
		const _fsFlock = fsFlock.replace('${NUM}', Config.numParticles);
		this.shader = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, _fsFlock);
		this.meshTri = alfrid.Geom.bigTriangle();
	}


	_saveExtraInfo() {
		const { numParticles:num } = Config;

		let extras = [];
		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				extras = extras.concat([Math.random() * 255, Math.random() * 255, Math.random() * 255, 255.0]);
			}
		}

		console.log(extras.length);
		this.textureExtra = new alfrid.GLTexture(extras, {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		}, num, num);
	}

	update(mHit, mHitForce, mCenter) {
		this._fbo.write.bind();

		//	simulation
		GL.clear(0, 0, 0, 0);
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("textureExtra", "uniform1i", 1);
		this.textureExtra.bind(1);
		this.shader.uniform("uMaxRadius", "float", Config.maxRadius);
		GL.draw(this.meshTri);
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime);

		this.shader.uniform("uHit", "vec3", mHit);
		this.shader.uniform("uHitForce", "float", mHitForce);
		this.shader.uniform(Config.simulation);
		this.shader.uniform("uCenter", "vec3", mCenter);

		this._fbo.write.unbind();
		this._fbo.swap();
	}


	get texture() {
		return this._fbo.readTexture;
	}

}


export default KoiSimulation;
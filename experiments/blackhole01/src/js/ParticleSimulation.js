// ParticleSimulation.js

import alfrid, { GL } from 'alfrid';
import ViewSim from './ViewSim';
import ViewSave from './ViewSave';
import FboPingPong from './FboPingPong';
import Config from './Config';
let vSim;

class ParticleSimulation {

	constructor() {
		//	textures
		const { numParticles } = Config;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};
		this._fboParticle 	= new FboPingPong(numParticles, numParticles, o, 4);

		//	views
		if(!vSim) {
			vSim 	= new ViewSim();	
		}

		this._vSave = new ViewSave();


		//	save default particle positions
		this._fboParticle.read.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboParticle.read.unbind();

		this._fboParticle.write.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboParticle.write.unbind();
	}


	update() {
		const fboParticle = this._fboParticle;

		fboParticle.write.bind();
		GL.clear(0, 0, 0, 1);
		vSim.render(
			fboParticle.read.getTexture(1), 
			fboParticle.read.getTexture(0), 
			fboParticle.read.getTexture(2),
			fboParticle.read.getTexture(3),
			false
			);
		fboParticle.write.unbind();
		fboParticle.swap();
	}


	get texturePos() {
		return this._fboParticle.read.getTexture(0);
	}

	get textureVel() {
		return this._fboParticle.read.getTexture(1);
	}

	get textureExtra() {
		return this._fboParticle.read.getTexture(2);
	}

	get textureOrgPos() {
		return this._fboParticle.read.getTexture(3);
	}


	get fboParticle() {
		return this._fboParticle;
	}
}

export default ParticleSimulation;
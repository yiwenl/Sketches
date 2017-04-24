// Simulation.js

import alfrid, { GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewSaveOuter from './ViewSaveOuter';
import ViewSim from './ViewSim';

class Simulation {
	
	constructor(mScene, fsSim, numParticles, isOuter=false) {
		this._numParticles = numParticles;
		this.cameraOrtho = mScene.cameraOrtho;
		this.camera = mScene.camera;
		this._fsSim = fsSim;
		this._isOuter = isOuter;
		this._init();
	}


	_init() {
		//	textures
		const numParticles = this._numParticles;

		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);

		//	views
		this._vSave = this._isOuter ? new ViewSaveOuter(this._numParticles) : new ViewSave(this._numParticles);
		this._vSim 	  = new ViewSim(this._fsSim);
		

		//	save position
		GL.setMatrices(this.cameraOrtho);
		this._fboCurrent.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboCurrent.unbind();

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboTarget.unbind();
	}


	update() {
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0), this._fboCurrent.getTexture(2));
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;
	}


	get current() {
		return this._fboTarget.getTexture();
	}

	get next() {
		return this._fboCurrent.getTexture();
	}

	get extras() {
		return this._fboCurrent.getTexture(2);
	}

	get maps() {
		return this._fbos;
	}

}

export default Simulation;
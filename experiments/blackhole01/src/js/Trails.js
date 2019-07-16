
import alfrid, { GL } from 'alfrid';

import Config from './Config';
import FboArray from './FboArray';

import ViewSave from './ViewSave';
import ViewSim from './ViewSim';
import ViewTrail from './ViewTrail';
import ViewTrialDebug from './ViewTrialDebug';


class Trail {

	constructor() {
		const { numTrails, trailLength, numTrailSets } = Config;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		const numTextures = (trailLength - 1) * numTrailSets + 1;

		this._fbo = new FboArray(numTextures, numTrails, numTrails, o, 4);


		//	save positions
		this.cameraOrtho  = new alfrid.CameraOrtho();
		this._vSim        = new ViewSim(0.5, 0.25, true);
		this._vSave       = new ViewSave(numTrails, 0.0);
		this._vTrail      = new ViewTrail();
		this._vTrailDebug = new ViewTrialDebug();

		GL.setMatrices(this.cameraOrtho);

		this._fbo.all.forEach(fbo => {
			fbo.bind();
			GL.clear(0, 0, 0, 0);
			this._vSave.render();
			fbo.unbind();
		})
	}


	update(touch) {
		this._fbo.write.bind();
		GL.clear(0, 0, 0, 0);

		this._vSim.render(
			this._fbo.read.getTexture(1), 
			this._fbo.read.getTexture(0), 
			this._fbo.read.getTexture(2),
			this._fbo.read.getTexture(3),
			false,
			touch
		);

		this._fbo.write.unbind();

		this._fbo.swap();
	}


	render(textureBg1, textureBg2) {
		this._vTrail.render(this._fbo.all, textureBg1, textureBg2);
		// this._vTrailDebug.render(this._fbo.read.getTexture(0));
	}
}


export default Trail;
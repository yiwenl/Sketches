// SubsceneBackground.js

import alfrid, { GL } from 'alfrid';

import ViewSky from './ViewSky';
import ViewFarMountains from './ViewFarMountains';
import ViewFloor from './ViewFloor';
import ViewClouds from './ViewClouds';

class SubsceneBackground {
	constructor(mRootScene) {
		this._rootScene = mRootScene;

		this._initTextures();
		this._initViews();
	}


	_initTextures() {

	}

	_initViews() {
		this._vSky = new ViewSky();
		this._vFarMountains = new ViewFarMountains();
		this._vFloor = new ViewFloor();
		this._vClouds = new ViewClouds();
	}


	update() {

	}


	render() {
		this._vSky.render();
		this._vFarMountains.render();
		this._vFloor.render();
		this._vClouds.render();
	}
}


export default SubsceneBackground;
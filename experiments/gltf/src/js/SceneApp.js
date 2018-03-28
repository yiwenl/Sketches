// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewMicro from './ViewMicro';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox();

		// this._vModel = new ViewObjModel();

		this._vMicro = new ViewMicro();

		this.env = 'studio1';
		
		const envs = [];
		for(let i=1; i<=12; i++) {
			envs.push(`studio${i}`);
		}

		this._updateEnvMap();

		gui.add(this, 'env', envs).onFinishChange(()=>this._updateEnvMap());
	}


	_updateEnvMap() {
		this.textureIrr = Assets.get(`${this.env}_irradiance`);
		this.textureRad = Assets.get(`${this.env}_radiance`);
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._bSky.draw(this.textureRad);
		this._vMicro.render(this.textureIrr, this.textureRad);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
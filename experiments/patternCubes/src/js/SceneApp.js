// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewCubes from './ViewCubes';
import TextureGenerator from './TextureGenerator';
import Assets from './Assets';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this.cameraOrtho = new alfrid.CameraOrtho();

		// const s = 5;
		const scale = .01;
		const w = window.innerWidth/2 * scale;
		const h = window.innerHeight/2 * scale;
		this.cameraOrtho.ortho(-w, w, -h, h, -10000.1, 10000);

		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;


		this.useOrthoCamera = true;
		this.showTexture = false;
		gui.add(this, 'useOrthoCamera');
		gui.add(this, 'showTexture');

		this.control = new alfrid.OrbitalControl(this.cameraOrtho, window, 100);
		this.control.lock(true);
		const RAD = Math.PI/180;
		this.control.rx.value = 35.4 * RAD;
		this.control.ry.value = 45 * RAD;
	}

	_initTextures() {
		console.log('init textures');
		this._generator = new TextureGenerator();
		this.texture = this._generator.texture;
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox();

		// this._vModel = new ViewObjModel();
		this._vCubes = new ViewCubes();
	}


	render() {
		// if(Math.random() > .9) {
		// 	const DEG = 180 / Math.PI;
		// 	console.log(this.control.rx.value * DEG, this.control.ry.value * DEG);
		// }
		// this.orbitalControl.ry.value += 0.01;
		GL.clear(0, 0, 0, 0);
		if(this.useOrthoCamera) {
			GL.setMatrices(this.cameraOrtho);	
		}
		
		this._bAxis.draw();
		this._bDots.draw();

		this._vCubes.render(this.texture);


		if(this.showTexture) {
			GL.disable(GL.DEPTH_TEST);
			const s = 256 * 2;
			GL.viewport(0, 0, s, s);
			this._bCopy.draw(this.texture);
			GL.enable(GL.DEPTH_TEST);	
		}
		
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);

		const scale = .01;
		const w = window.innerWidth/2 * scale;
		const h = window.innerHeight/2 * scale;
		this.cameraOrtho.ortho(-w, w, -h, h, -10000.1, 10000);
	}
}


export default SceneApp;
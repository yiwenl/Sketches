// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';

import ViewDebugPlane from './ViewDebugPlane';
import ViewMountains from './ViewMountains';
import ViewMist from './ViewMist';

import Noise3D from './Noise3D';

const interval = 25;

class SceneApp extends Scene {
	constructor() {

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;


		this._mtxModel = mat4.create();
		mat4.translate(this._mtxModel, this._mtxModel, vec3.fromValues(0, -0.5, 0));


		this._lightPos = vec3.fromValues(6, 3, 6);

		//*/
		this._cameraLight = new alfrid.CameraOrtho();
		let s = 5;
		this._cameraLight.ortho(-s, s, -s, s, 1, 30);
		/*/
		this._cameraLight = new alfrid.CameraPerspective();
		this._cameraLight.setPerspective(75 * Math.PI / 180, GL.aspectRatio, 1, 30);
		//*/
		this._cameraLight.lookAt(this._lightPos, [0, 0, 0]);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._mtxShadow = mat4.create();
		mat4.mul(this._mtxShadow, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.mul(this._mtxShadow, this._biasMatrix, this._mtxShadow);
		

		this._count = 0;

		this._updateShadowMap();
	}


	_initTextures() {
		console.log('init textures');
		const fboSize = 512 * 2;
		this._fboShadow = new alfrid.FrameBuffer(fboSize, fboSize, {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR
		});

		this._noises = new Noise3D(Config.noiseNum, Config.noiseScale);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		// this._bSky = new alfrid.BatchSkybox();

		this._vMountains = new ViewMountains();
		this._vFloor = new ViewDebugPlane();
		this._vMist = new ViewMist();
	}


	_updateShadowMap() {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight);
		GL.rotate(this._mtxModel);
		this._vMountains.render(this._lightPos);
		this._fboShadow.unbind();
	}

	updateFog() {
		this._count = 0;
		this._noises.update();
	}


	render() {
		this._count ++;
		if(this._count >= interval) {
			this.updateFog();
		}

		GL.clear(0, 0, 0, 0);
		GL.rotate(this._mtxModel);
		this._vFloor.render();

		let s = .1;
		this._bBall.draw(this._lightPos, [s, s, s], [1, 1, .8]);

		this._vMountains.render(this._lightPos);
		this._vMist.render(
			this._mtxShadow, 
			this._fboShadow.getDepthTexture(),
			this._noises.texture0,
			this._noises.texture1,
			this._count / interval
			);


		GL.disable(GL.DEPTH_TEST);

		s = 256;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._noises.texture0);

		GL.viewport(0, 0, s, s/GL.aspectRatio);
		this._bCopy.draw(this._fboShadow.getDepthTexture());

		GL.enable(GL.DEPTH_TEST);
	}


	toResize(w, h) {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		w = w || innerWidth;
		h = h || innerHeight;
		GL.setSize(w, h);
		let tw = Math.min(w, innerWidth);
		let th = Math.min(h, innerHeight);

		const sx = innerWidth / w;
		const sy = innerHeight / h;
		const scale = Math.min(sx, sy);
		tw = w * scale;
		th = h * scale;

		GL.canvas.style.width = `${tw}px`;
		GL.canvas.style.height = `${th}px`;
		this.camera.setAspectRatio(GL.aspectRatio);
	}

	resize() {
		this.toResize(window.innerWidth, window.innerHeight);
	}
}


export default SceneApp;
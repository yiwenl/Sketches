// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import Config from './Config';

import CapturePos from './CapturePos';

import ViewParticles from './ViewParticles';
import ViewBg from './ViewBg';

class SceneApp extends Scene {
	constructor() {

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;


		let r = 5;
		let s = 2;
		this._posFront = vec3.fromValues(0, 0, r);
		this._posBack = vec3.fromValues(0, 0, -r);
		this._posRight = vec3.fromValues(r, 0, 0);
		this._posLeft = vec3.fromValues(-r, 0, 0);
		this._posTop = vec3.fromValues(0, r, 0);
		this._posBottom = vec3.fromValues(0, -r, 0);

		const cameraPos = [
			this._posFront,
			this._posBack,
			this._posLeft,
			this._posRight,
			this._posTop,
			this._posBottom
		];

		this._cameras = cameraPos.map( pos => {
			const camera = new alfrid.CameraOrtho();
			camera.ortho(-s, s, -s, s);
			const top = pos[1] === 0 ? [0, 1, 0] : [1, 0, 0];
			camera.lookAt(pos, [0, 0, 0], top);

			return camera;
		});

		// console.table(this._cameras);


		this._cameraFront = new alfrid.CameraOrtho();
		this._cameraFront.ortho(-s, s, -s, s);
		this._cameraFront.lookAt(this._posFront, [0, 0, 0]);


		this._capture();
	}


	_initTextures() {
		console.log('init textures');

		const fboSize = 1024;
		this._fboFront = new alfrid.FrameBuffer(fboSize, fboSize, {
			type:GL.FLOAT
		}, 2);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox();
		this._bBall = new alfrid.BatchBall();

		this._vModel = new ViewObjModel();
		this._vParticles = new ViewParticles();
		this._vBg = new ViewBg();
	}


	_capture() {
		this._fboFront.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraFront);
		this._vModel.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));
		this._fboFront.unbind();

		const fboSize = 1024;
		

		this._captures = this._cameras.map( camera => {
			const fbo = new alfrid.FrameBuffer(fboSize, fboSize, {
				type:GL.FLOAT
			}, 2);


			fbo.bind();
			GL.clear(0, 0, 0, 0);
			GL.setMatrices(camera);
			this._vModel.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));
			fbo.unbind();

			return fbo;
		});
	}


	render() {
		GL.clear(0, 0, 0, 0);

		GL.disable(GL.DEPTH_TEST);
		this._vBg.render();
		GL.enable(GL.DEPTH_TEST);


		this._captures.forEach( fbo => {
			this._vParticles.render(fbo.getTexture(1), fbo.getTexture(0));			
		});

		let s = .1;

		s = 64;

		// this._captures.forEach( (fbo, i) => {
		// 	GL.viewport(i * s, 0, s, s);
		// 	this._bCopy.draw(fbo.getTexture(0));
		// })

		// this._captures.forEach( (fbo, i) => {
		// 	GL.viewport(i * s, s, s, s);
		// 	this._bCopy.draw(fbo.getTexture(1));
		// })

		// GL.viewport(0, 0, s, s);
		// this._bCopy.draw(this._fboFront.getTexture(0));

		// GL.viewport(s, 0, s, s);
		// this._bCopy.draw(this._fboFront.getTexture(1));
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
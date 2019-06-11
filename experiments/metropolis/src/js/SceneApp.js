// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import Config from './Config';

import ViewCubes from './ViewCubes';
import ViewFloor from './ViewFloor';


import CityGenerator from './CityGenerator';

class SceneApp extends Scene {
	constructor() {

		super();
		this.resize();
		GL.enableAlphaBlending();
		
		// 
		this.orbitalControl.radius.value = 5;
		this._lightPos = vec3.fromValues(5, 2.5, -5);
		this.cameraLight = new alfrid.CameraOrtho();
		let s = 6;
		this.cameraLight.ortho(-s, s, -s, s, 1, 20);
		this.cameraLight.lookAt(this._lightPos, [0, 0, 0]);


		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this.mtxShadow = mat4.create();
		mat4.mul(this.mtxShadow, this.cameraLight.projection, this.cameraLight.matrix);
		mat4.mul(this.mtxShadow, this._biasMatrix, this.mtxShadow);

		s = 4;
		this.cameraOrtho.ortho(-s, s, -s, s, .1, 500);

		const controls = {
			topView:() => {
				this.orbitalControl.rx.value = Math.PI/2;
				this.orbitalControl.ry.value = 0;
			},
			sideView:() => {
				this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
			}
		}

		controls.sideView();


		setTimeout(()=> {
			gui.add(controls, 'topView');
			gui.add(controls, 'sideView');
		}, 500);
	}


	_initTextures() {
		console.log('init textures');

		const fboSize = 2048;
		this._fboShadow = new alfrid.FrameBuffer(fboSize, fboSize);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		// this._vModel = new ViewObjModel();

		this._generator = new CityGenerator();
		this._vCubes = new ViewCubes(this._generator.buildings);
		this._vFloor = new ViewFloor();
	}


	renderShadowMap() {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.cameraLight);
		this._vCubes.renderShadowMap();
		this._fboShadow.unbind();
	}


	render() {
		this.cameraOrtho.lookAt(this.camera.position, [0, 0, 0]);
		this.renderShadowMap();
		// GL.clear(0, 0, 0, 0);
		GL.clear(1, 1, 1, 1);

		GL.setMatrices(this.camera);
		// GL.setMatrices(this.cameraOrtho);
		// this._bSky.draw(Assets.get('irr'));

		this._vCubes.render(this.mtxShadow, this._fboShadow.getDepthTexture(), this._lightPos);
		this._vFloor.render();

/*
		let s = .25;

		GL.disable(GL.DEPTH_TEST);
		s = 300;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._fboShadow.getTexture());
		GL.viewport(s, 0, s, s);
		this._bCopy.draw(this._fboShadow.getDepthTexture());
		GL.enable(GL.DEPTH_TEST);
*/
		// this._vModel.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aomap'));
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
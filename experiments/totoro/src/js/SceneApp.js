// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
// import Settings from './Settings';
import Config from './Config';

import ViewFloor from './ViewFloor';
import ViewGrass from './ViewGrass';
import ViewFXAA from './ViewFXAA';
import Noise from './Noise';
import TouchDetector from './TouchDetector';

class SceneApp extends Scene {
	constructor() {
		// Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.ry.value = -.2;
		this.orbitalControl.rx.value = .8;
		this.orbitalControl.radius.value = 8;
		this.orbitalControl.rx.limit(.8, 1.0);
		this.orbitalControl.radius.limit(5, 8);

		this._detector = new TouchDetector(this._vFloor.mesh, this.camera, false, GL.canvas);
		this._hit = vec3.create();
		this._detector.on('onHit', (e)=> {
			vec3.copy(this._hit, e.detail.hit);
			vec3.transformMat4(this._hit, this._hit, this.mtxInvert);
		});

		this.mtx = mat4.create();
		this.mtxHit = mat4.create();
		this.mtxInvert = mat4.create();
		this.updateMatrix();

		// setTimeout(()=> {
		// 	gui.add(Config, 'numGrass', 100, 5000).step(100).onFinishChange(Settings.reload);
		// 	gui.add(Config, 'grassSize', 1, 5).onFinishChange(Settings.reload);
		// 	gui.add(Config, 'uvScale', 0, 2).onChange(Settings.refresh);
		// 	gui.add(Config, 'y', -5, 0).onChange(()=> {
		// 		this.updateMatrix();
				
		// 		Settings.refresh();
		// 	});
		// }, 500);
	}


	updateMatrix() {
		mat4.identity(this.mtx);

		// this.orbitalControl.center[1] = this.orbitalControl.positionOffset[1] = -Config.y;
		mat4.translate(this.mtx, this.mtx, vec3.fromValues(0, Config.y, 0));
		mat4.translate(this.mtxHit, this.mtx, vec3.fromValues(0, Config.y + 1, 0));
		mat4.invert(this.mtxInvert, this.mtxHit);
		mat4.copy(this._detector.mtxModel, this.mtxHit);
	}

	_initTextures() {
		console.log('init textures');


		this._noise = new Noise();
		this._title = Assets.get('title');
		console.log(this._title.width, this._title.height);
		this.ratioTitle = this._title.width / this._title.height;
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vFloor = new ViewFloor();
		this._vGrass = new ViewGrass();
		this._vFxaa = new ViewFXAA();
	}


	render() {
		this._noise.update();

		GL.clear(0, 0, 0, 0);

		this._fboRender.bind();
		GL.clear(1, 1, 1, 1);
		GL.rotate(this.mtx);

		this._vFloor.render();
		this._vGrass.render(this._noise.texture, this._hit);

		const margin = 30;
		GL.viewport(margin, margin, this._title.width, this._title.height);
		// this._bCopy.draw(this._title);
		this._fboRender.unbind();


		this._vFxaa.render(this._fboRender.getTexture());
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;

		const ratio = 1350 / 1080;
		let w, h;
		if(innerWidth > innerHeight) {
			h = Math.min(1350, window.innerHeight * .8);
			w = h / ratio;
		} else {
			w = Math.min(1080, window.innerWidth * .8);
			h = w * ratio;
		}
		

		GL.setSize(w, h);
		GL.canvas.style.width = `${w}px`;
		GL.canvas.style.height = `${h}px`;
		this.camera.setAspectRatio(GL.aspectRatio);

		this._fboRender = new alfrid.FrameBuffer(w, h);
	}
}


export default SceneApp;
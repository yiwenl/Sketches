// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';

import ViewTracing from './ViewTracing';
import ViewBall from './ViewBall';
import ViewUnpack from './ViewUnpack';

const RAD = Math.PI / 180;


class SceneApp extends Scene {
	constructor() {

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 10;



		this._lightPos = vec3.fromValues(2, 2, 0);

		this._lightDir = vec3.clone(this._lightPos);
		vec3.scale(this._lightDir, this._lightDir, -1);
		vec3.normalize(this._lightDir, this._lightDir);

		this._camLight = new alfrid.CameraPerspective();
		const fov = 45 * RAD;
		this._camLight.setPerspective(fov, 1, .1, 10);
		this._camLight.lookAt(this._lightPos, [0, 0, 0]);


		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._camLight.projection, this._camLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);


		this._posBall = vec3.fromValues(1, 1, 0);
	}


	_initTextures() {
		console.log('init textures');

		const fboSize = 512;
		this._fboShadow = new alfrid.FrameBuffer(fboSize, fboSize);
		// this._fboShadow.getTexture().showParameters();
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._bBall = new alfrid.BatchBall();

		this._vTracking = new ViewTracing();
		this._vBall = new ViewBall();
		this._vUnpack = new ViewUnpack();
	}

	_updateShadowMap() {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);

		let s = .1;
		let g = .5;
		GL.setMatrices(this._camLight);
		// this._bBall.draw(this._posBall, [s, s, s], [g, g, g])
		// this._vBall.render(this._lightPos);
		this._vBall.renderDepth();

		this._fboShadow.unbind();
	}


	render() {
		this._updateShadowMap();
		GL.clear(0, 0, 0, 0);

		GL.setMatrices(this.camera);

		this._bAxis.draw();
		this._bDots.draw();

		let s = .1;
		let g = .5;
		this._bBall.draw(this._lightPos, [s, s, s], [1, 1, 1])
		this._vBall.render(this._lightPos);


		this._vTracking.render(this._lightPos, this._lightDir, this._shadowMatrix);


		GL.disable(GL.DEPTH_TEST);
		s = 200;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._fboShadow.getDepthTexture());
		GL.viewport(s, 0, s, s);
		// this._bCopy.draw(this._fboShadow.getTexture());
		this._vUnpack.render(this._fboShadow.getTexture());

		// GL.view
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
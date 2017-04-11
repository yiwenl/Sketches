// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewCubes from './ViewCubes';
import ViewPost from './ViewPost';
import ViewSSAO from './ViewSSAO';
import ViewFxaa from './ViewFxaa';
import Assets from './Assets';
import TouchDetect from './TouchDetect';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.camera.setPerspective(60 * Math.PI/180, GL.aspectRatio, .25, 50);
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;


		this._meshTest = alfrid.Geom.sphere(2, 24);

		// const s = 2;
		// this._meshTest = alfrid.Geom.cube(s, s, s);
		this._touch = new TouchDetect(this._meshTest, this.camera, GL.canvas);
	}

	_initTextures() {
		console.log('init textures');

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);

		const oPost = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
		};

		const fboScale = 1;
		this._fboAO = new alfrid.FrameBuffer(GL.width * fboScale, GL.height * fboScale, oPost);
		this._fboFXAA  = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();
		this._bSky = new alfrid.BatchSkybox();

		this._vModel = new ViewObjModel();
		this._vCubes = new ViewCubes();

		this._vAO = new ViewSSAO();
		this._vPost = new ViewPost();
		this._vFxaa = new ViewFxaa();
	}


	render() {
		this._fboRender.bind();
		GL.clear(1, 1, 1, 1);
		// this._bSky.draw(Assets.get('irr'));


		const r = 3;
		this._vCubes.render(Assets.get('studio_radiance'), Assets.get('irr'), this._touch.hit);
		// this._bBall.draw([0, 0, 0], [r, r, r], [1, 0, 0], .25);
		// this._bBall.draw(this._touch.hit, [.1, .1, .1], [0, 1, 1], 1);
		this._fboRender.unbind();


		this._fboAO.bind();
		GL.clear(0, 0, 0, 0);
		this._vAO.render(this._fboRender.getDepthTexture(), GL.width, GL.height);
		this._fboAO.unbind();

		this._fboFXAA.bind();
		GL.clear(0, 0, 0, 0);
		this._vPost.render(this._fboRender.getTexture(), this._fboAO.getTexture());
		this._fboFXAA.unbind();


		GL.clear(0, 0, 0, 0);
		this._vFxaa.render(this._fboFXAA.getTexture());


		const size = 200;
		const w = size * GL.aspectRatio
		GL.disable(GL.DEPTH_TEST);
		GL.viewport(0, 0, w, size);
		// this._bCopy.draw(this._fboRender.getDepthTexture());
		// GL.viewport(0, size, w, size);
		this._bCopy.draw(this._fboAO.getTexture());
		GL.enable(GL.DEPTH_TEST);
		// this._bCopy.draw(this._fboRender.getTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
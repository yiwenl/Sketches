// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

import ViewBg from './ViewBg';
import ViewPixels from './ViewPixels';
import ViewPost from './ViewPost';
import PassBloom from './PassBloom';

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		const RAD = Math.PI / 180;
		this.camera.setPerspective(90 * RAD, GL.aspectRatio, .01, 150);
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 3;
		this.orbitalControl.radius.limit(3, 3)
	}

	_initTextures() {
		console.log('init textures');

		this._fboBg = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);

	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._vBg = new ViewBg();
		this._vPixels = new ViewPixels();
		this._passBloom = new PassBloom(5, 1);
		this._vPost = new ViewPost();
	}


	render() {
		// this.orbitalControl.ry.value += 0.01;
		this._fboBg.bind();
		GL.clear(0, 0, 0, 0);
		this._vBg.render();
		this._fboBg.unbind();

		// this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		GL.disable(GL.DEPTH_TEST);
		this._bCopy.draw(this._fboBg.getTexture());
		GL.enable(GL.DEPTH_TEST);
		this._vPixels.render(this._fboBg.getTexture(), GL.camera.position);
		// this._fboRender.unbind();

		// this._passBloom.render(this._fboRender.getTexture());

		// GL.clear(0, 0, 0, 0);
		// GL.disable(GL.DEPTH_TEST);
		// GL.viewport(0, 0, GL.width, GL.height);
		// GL.enableAdditiveBlending();
		// this._vPost.render(this._fboRender.getTexture(), this._passBloom.getTexture());

		// GL.enableAlphaBlending();
		// GL.enable(GL.DEPTH_TEST);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
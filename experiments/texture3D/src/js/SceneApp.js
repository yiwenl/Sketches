// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewCubeNoise from './ViewCubeNoise';
import ViewPlane from './ViewPlane';
import ViewNoise from './ViewNoise';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

class SceneApp extends Scene {
	constructor() {
		Settings.init();
		// GL.enableAdditiveBlending();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;

		const numTextures = 16;
		const fboSize = 512;
		this._fbos = [];

		for(let i=0; i<numTextures; i++) {
			const fbo = new alfrid.FrameBuffer(fboSize, fboSize);

			fbo.bind();
			let g = i/numTextures;
			GL.clear(g, g, g, 1);

			let p = i/numTextures * 2 - 1;

			this._vNoise.render(p * 0.5);

			fbo.unbind();

			this._fbos.push(fbo);
		}

		gui.add(Config, 'noiseScale', 1, 10).onFinishChange(Settings.reload);
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._vCube = new ViewCubeNoise();
		this._vPlane = new ViewPlane();
		this._vNoise = new ViewNoise();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._bAxis.draw();
		this._bDots.draw();

		this._vCube.render();

		// GL.disable(GL.DEPTH_TEST);

		const num = 16 * 4;

		// this._fbos.forEach( (fbo, i) => {
		for(let i=0; i<num; i++) {
			let z = i/num * 2 - 1;
			this._vPlane.render(this._fbos, z * 0.5, 16 );
		}

		// GL.enable(GL.DEPTH_TEST);

	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
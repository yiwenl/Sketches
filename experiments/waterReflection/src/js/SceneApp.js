// SceneApp.js

import alfrid , { Scene } from 'alfrid';
import ViewCube from './ViewCube';
import ViewReflection from './ViewReflection';
import ViewNoise from './ViewNoise';
import ViewNormal from './ViewNormal';

const GL = alfrid.GL;

window.getAsset = function(id) {
	for(var i=0; i<assets.length; i++) {
		if(id === assets[i].id) {
			return assets[i].file;
		}
	}
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = .4;
	}

	_initTextures() {
		console.log('init textures');

		const REFLECTION_SIZE = 1024;
		this._fboReflection = new alfrid.FrameBuffer(REFLECTION_SIZE, REFLECTION_SIZE);
		this._textureNormal = new alfrid.GLTexture(getAsset('normal'));

		const NOISE_SIZE = 1024;
		this._fboNoise = new alfrid.FrameBuffer(NOISE_SIZE, NOISE_SIZE);
		this._fboNormal = new alfrid.FrameBuffer(NOISE_SIZE, NOISE_SIZE);

	}


	_initViews() {
		console.log('init views');
		
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vCube = new ViewCube();
		this._vReflection = new ViewReflection();
		this._vNoise = new ViewNoise();
		this._vNormal = new ViewNormal();
	}


	render() {
		GL.clear(0, 0, 0, 0);
		this._bAxis.draw();
		this._bDots.draw();


		// this._fboReflection.bind();
		// GL.clear(0, 0, 0, 0);
		// GL.gl.cullFace(GL.gl.FRONT);
		// this._vCube.render(true);
		// GL.gl.cullFace(GL.gl.BACK);
		// this._fboReflection.unbind();

		// GL.disable(GL.DEPTH_TEST);
		// this._vReflection.render(this._fboReflection.getTexture(), this._textureNormal);
		// GL.enable(GL.DEPTH_TEST);

		// this._vCube.render(false);

		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render();
		this._fboNoise.unbind();

		this._fboNormal.bind();
		GL.clear(0, 0, 0, 0);
		this._vNormal.render(this._fboNoise.getTexture());
		this._fboNormal.unbind();

		const size = 300;
		GL.viewport(0, 0, size, size);
		this._bCopy.draw(this._fboNoise.getTexture());
		GL.viewport(size, 0, size, size);
		this._bCopy.draw(this._fboNormal.getTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
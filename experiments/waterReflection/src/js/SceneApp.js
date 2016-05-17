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

		//	limit camera angle
	}

	_initTextures() {
		console.log('init textures');

		const REFLECTION_SIZE = 1024;
		//	fullsize reflection fbo ? 
		this._fboReflection = new alfrid.FrameBuffer(REFLECTION_SIZE, REFLECTION_SIZE);
		this._textureNormal = new alfrid.GLTexture(getAsset('normal'));
		this._textureNoise = new alfrid.GLTexture(getAsset('noise'));

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
		//	update mountain positioin ( keep moving forward )
		//	update boat direction ( based on keyboard control )

		GL.clear(0, 0, 0, 0);
		this._bAxis.draw();
		this._bDots.draw();

		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render(this._textureNoise);
		this._fboNoise.unbind();

		this._fboNormal.bind();
		GL.clear(0, 0, 0, 0);
		this._vNormal.render(this._fboNoise.getTexture());
		this._fboNormal.unbind();

		this._fboReflection.bind();
		GL.clear(0, 0, 0, 0);
		GL.gl.cullFace(GL.gl.FRONT);
		this._vCube.render(true);
		//	render skybox ( reflection map )

		//	render mountains

		//	render boat
		GL.gl.cullFace(GL.gl.BACK);
		this._fboReflection.unbind();

		GL.disable(GL.DEPTH_TEST);
		this._vReflection.render(this._fboReflection.getTexture(), this._fboNormal.getTexture());
		GL.enable(GL.DEPTH_TEST);

		this._vCube.render(false);

		
		//*/
		const size = 200;
		GL.viewport(0, 0, size, size);
		this._bCopy.draw(this._fboNoise.getTexture());
		GL.viewport(size, 0, size, size);
		this._bCopy.draw(this._fboNormal.getTexture());
		//*/
	}


	renderReflection() {

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewRender from './ViewRender';

import Wave from './Wave';
import SoundManager from './SoundManager';

const NUM_WAVES = 8;

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/3, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 15;
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;


		//	camera shadow
		this._cameraLight = new alfrid.CameraOrtho();
		const size = 15;
		this._cameraLight.ortho(-size, size, size, -size, 2, 50);
		this._cameraLight.lookAt(params.light, [0, 0, 0]);
		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);


		this._mtx = mat4.create();
		SoundManager.on('onBeat', (o)=>this._onBeat(o.detail)); 

		//	views
		this._vRender = new ViewRender(this._shadowMatrix);
	}

	_initTextures() {
		const size = 512;
		// this._fboDepth = new alfrid.FrameBuffer(size, size, {minFilter:GL.NEAREST, magFilter:GL.NEAREST});
		this._fboDepth = new alfrid.FrameBuffer(size, size);
		this._waves = [];
		for(let i=0; i<NUM_WAVES; i++) {
			let wave = new Wave(this);
			this._waves.push(wave);
		}
		
	}


	_onBeat(o) {
		const wave = this._waves.pop();
		wave.reset(o);

		this._waves.unshift(wave);
	}

	render() {
		//	update particles
		this._waves.forEach( w => w.update());


		//	update shadow map
		this.renderShadowMap();


		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);

		// const s = .5;
		// this._bBall.draw(params.light, [s, s, s], [1, 1, .9]);

		this._waves.forEach( w => w.render(this._vRender, this._shadowMatrix, this._fboDepth.getDepthTexture()));

		GL.rotate(this._mtx);

		// const size = 256;
		// GL.viewport(0, 0, size, size);
		// this._bCopy.draw(this._fboSphere.getDepthTexture());

	}

	renderShadowMap() {
		this._fboDepth.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight);

		this._waves.forEach( w => w.renderShadow(this._vRender, this._shadowMatrix));
		this._fboDepth.unbind();
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
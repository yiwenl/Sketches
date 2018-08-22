// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewAddVel from './ViewAddVel';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';

import Settings from './Settings';
import Config from './Config';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		Settings.init();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/3, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 18;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;


		//	shadow mapping
		this._cameraLight = new alfrid.CameraOrtho();
		const s = 20;
		this._cameraLight.ortho(-s, s, -s, s, 1, 30);
		// this._cameraLight.lookAt(Config.lightPos, [0, 0, 0], [0, 1, 0]);
		// this._cameraLight.lookAt([0, 10, 0], [0, 0, 0], [0, 0, -1]);
		this._cameraLight.lookAt([2, 10, 2], [0, 0, 0]);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);


		// console.log(alfrid.WebglNumber);

	}

	_initTextures() {
		console.log('init textures');

		const type = GL.FLOAT || GL.HALF_FLOAT;

		console.log('Type : ', alfrid.WebglNumber[type]);
		console.log('Type : ', alfrid.WebglNumber[type]);
		console.log('Type : ', alfrid.WebglNumber[type]);
		this.type = alfrid.WebglNumber[type];

		setTimeout(()=> {
			// console.log(gui.addText);
			gui.add(this,'type');
		}, 500);

		//	FBOS
		const numParticles = Config.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.HALF_FLOAT
		};

		this._fboCurrentPos = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboCurrentVel = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetVel  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboExtra  	= new alfrid.FrameBuffer(numParticles, numParticles, o);


		const shadowMapSize = 256 * 2;
		this._fboShadow = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize, {minFilter:GL.LINEAR, magFilter:GL.LINEAR, type:GL.FLOAT});
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._vFloor = new ViewFloor();


		//	views
		this._vAddVel = new ViewAddVel();
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();

		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);

		this._fboCurrentPos.bind();
		this._vSave.render(0);
		this._fboCurrentPos.unbind();

		this._fboExtra.bind();
		this._vSave.render(1);
		this._fboExtra.unbind();

		this._fboTargetPos.bind();
		this._bCopy.draw(this._fboCurrentPos.getTexture());
		this._fboTargetPos.unbind();

		GL.setMatrices(this.camera);
	}


	updateFbo() {
		//	Update Velocity : bind target Velocity, render simulation with current velocity / current position
		this._fboTargetVel.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrentVel.getTexture(), this._fboCurrentPos.getTexture(), this._fboExtra.getTexture());
		this._fboTargetVel.unbind();


		//	Update position : bind target Position, render addVel with current position / target velocity;
		this._fboTargetPos.bind();
		GL.clear(0, 0, 0, 1);
		this._vAddVel.render(this._fboCurrentPos.getTexture(), this._fboTargetVel.getTexture());
		this._fboTargetPos.unbind();

		//	SWAPPING : PING PONG
		let tmpVel          = this._fboCurrentVel;
		this._fboCurrentVel = this._fboTargetVel;
		this._fboTargetVel  = tmpVel;

		let tmpPos          = this._fboCurrentPos;
		this._fboCurrentPos = this._fboTargetPos;
		this._fboTargetPos  = tmpPos;

	}

	_renderShadowMap() {
		this._fboShadow.bind();
		GL.clear(1, 0, 0, 1);
		GL.setMatrices(this._cameraLight);
		let p = this._count / Config.skipCount;
		this._vRender.renderShadow(
			this._fboTargetPos.getTexture(), 
			this._fboCurrentPos.getTexture(), 
			p, 
			this._fboExtra.getTexture()
		);
		this._fboShadow.unbind();
	}


	render() {

		this._count ++;
		if(this._count % Config.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		this._renderShadowMap();
		GL.setMatrices(this.camera);

		let p = this._count / Config.skipCount;

		GL.clear(0, 0, 0, 0);
		this._bAxis.draw();
		this._bDots.draw();

		this._vRender.render(
			this._fboTargetPos.getTexture(), 
			this._fboCurrentPos.getTexture(), 
			p, 
			this._fboExtra.getTexture(), 
			this._shadowMatrix, 
			this._fboShadow.getTexture()
		);

		this._vFloor.render(this._shadowMatrix, this._fboShadow.getTexture());

		const size = 128 * 1;
		GL.viewport(0, 0, size, size);
		this._bCopy.draw(this._fboTargetPos.getTexture());
		GL.viewport(size, 0, size, size);
		this._bCopy.draw(this._fboShadow.getTexture());
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
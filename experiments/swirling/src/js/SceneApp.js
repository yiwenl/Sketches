// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';
import SoundManager from './SoundManager';
import Assets from './Assets';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.rx = new alfrid.EaseNumber(0, 0.05);
		this.camMovement = new alfrid.EaseNumber(0, 0.05);
		this.ry = new alfrid.EaseNumber(0);

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 10.1;
		this.orbitalControl.radius.easing = 0.015;
		this.orbitalControl.center[1] = 2;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
		this.orbitalControl.lockZoom(true);

		this.mtxModel = mat4.create();


		//	light
		const lightOffset = 2.0;
		this.lightPosition = [-4 * lightOffset, params.maxRadius * 2.0, 10 * lightOffset];
		// this.lightPosition = [-0.2, params.maxRadius * 2.0, .5];
		this.cameraLight = new alfrid.CameraOrtho();
		const size = 15;
		this.cameraLight.ortho(-size, size, size, -size, 1, 30);
		this.cameraLight.lookAt(this.lightPosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
		this.shadowMatrix = mat4.create();
		mat4.multiply(this.shadowMatrix, this.cameraLight.projection, this.cameraLight.viewMatrix);
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		};


		this._particleSets = [];
		for(let i=0; i<params.numSets; i++) {
			const fboCurrent      = new alfrid.FrameBuffer(numParticles, numParticles, o, true);
			const fboTarget       = new alfrid.FrameBuffer(numParticles, numParticles, o, true);
			const oSet = {fboCurrent, fboTarget, count:i, randomSpwanPos:i%2 !== 0};			
			this._particleSets.push(oSet);
		}

		const shadowSize = params.shadowMapSize;
		this._fboShadow = new alfrid.FrameBuffer(shadowSize, shadowSize);

		console.table(this._particleSets);
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSky = new alfrid.BatchSky();


		//	views
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();
		this._vFloor  = new ViewFloor();

		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);


		for(let i=0; i<params.numSets; i++) {
			this._vSave.reset();
			let { fboTarget, fboCurrent } = this._particleSets[i];
			fboCurrent.bind();
			GL.clear(0, 0, 0, 0);
			this._vSave.render();
			fboCurrent.unbind();

			fboTarget.bind();
			GL.clear(0, 0, 0, 0);
			this._vSave.render();
			fboTarget.unbind();	
		}

		GL.setMatrices(this.camera);
	}


	updateFbo(o) {

		let { fboTarget, fboCurrent } = o;

		fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(
			fboCurrent.getTexture(1), 
			fboCurrent.getTexture(0), 
			fboCurrent.getTexture(2),
			fboCurrent.getTexture(3),
			o.randomSpwanPos
			);
		fboTarget.unbind();


		let tmp     = o.fboCurrent;
		o.fboCurrent = o.fboTarget;
		o.fboTarget  = tmp;

	}


	render() {
		if(SoundManager.sound) {
			if(SoundManager.currentTime > 180 && SoundManager.currentTime < 240) {
				params.minBeatDiff = 0.5;
			} else {
				params.minBeatDiff = 2.0;
			}

			if(SoundManager.currentTime > 195 && SoundManager.currentTime < 240) {
				params.lifeDecrease = 0.003;
			} else {
				params.lifeDecrease = 0.005;
			}
		}

		const data = SoundManager.getData();
		if(data) {
			this.ry.value = Math.pow(data.sum / 500, 3.0);
			// console.log(data.sum);
			this.orbitalControl.ry.value += this.ry.value;	
			this.orbitalControl.radius.value = params.maxRadius + data.sum/200 * 7;
			params.zoom = this.orbitalControl.radius.value;

			if(data.hasBeat) {
				this.rx.setTo(data.sum / 500);
				this.rx.value = 0;
			}
		}

		this.camMovement.value += this.rx.value;
		
		mat4.identity(this.mtxModel, this.mtxModel);
		mat4.translate(this.mtxModel, this.mtxModel, [0, params.maxRadius*0.5, 0]);

		this.orbitalControl.rx.value = Math.sin(this.camMovement.value) * 0.2 + 0.1;
		this.orbitalControl.center[1] = params.centery;


		for(let i=0; i<this._particleSets.length; i++) {
			let oSet = this._particleSets[i];
			oSet.count ++;

			if(oSet.count % params.skipCount == 0) {
				oSet.count = 0;
				this.updateFbo(oSet);
			}
		}


		this._fboShadow.bind();
		// GL.clear(1, 1, 1, 1);
		GL.clear(0, 0, 0, 0);
		GL.gl.depthFunc(GL.gl.LEQUAL);
		GL.setMatrices(this.cameraLight);
			
		for(let i=0; i<this._particleSets.length; i++) {
			let oSet = this._particleSets[i];
			let p = oSet.count / params.skipCount;
			let { fboTarget, fboCurrent } = oSet;

			this._vRender.render(
				fboTarget.getTexture(0), 
				fboCurrent.getTexture(0), 
				p, 
				fboCurrent.getTexture(2),
				fboCurrent.getTexture(3)
			);
		}

		this._fboShadow.unbind();

		GL.setMatrices(this.camera);

		GL.clear(0, 0, 0, 0);
		if(params.showAxis) {
			this._bAxis.draw();	
		}
		
		GL.rotate(this.mtxModel);

		this._bSky.draw(Assets.get('bg'));
		this._vFloor.render(this.shadowMatrix, this._fboShadow.getDepthTexture(), this._fboShadow.getTexture());

		for(let i=0; i<this._particleSets.length; i++) {
			let oSet = this._particleSets[i];
			let p = oSet.count / params.skipCount;
			let { fboTarget, fboCurrent } = oSet;

			this._vRender.render(
				fboTarget.getTexture(0), 
				fboCurrent.getTexture(0), 
				p, 
				fboCurrent.getTexture(2),
				fboCurrent.getTexture(3), 
				this.shadowMatrix, 
				this._fboShadow.getDepthTexture(),
				this._fboShadow.getTexture()
			);
		}

		// const size = GL.height/2;
		// GL.viewport(0, 0, size, size);
		// this._bCopy.draw(this._fboShadow.getTexture());
		// GL.viewport(0, size, size, size);
		// this._bCopy.draw(this._fboShadow.getDepthTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
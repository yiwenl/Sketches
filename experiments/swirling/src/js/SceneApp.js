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
		this.rx = new alfrid.EaseNumber(0, 0.025);
		this.camMovement = new alfrid.EaseNumber(0, 0.025);
		this.ry = new alfrid.EaseNumber(0);

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 10.1;
		this.orbitalControl.radius.easing = 0.015;
		this.orbitalControl.center[1] = 2;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
		this.orbitalControl.lock(true);

		this.mtxModel = mat4.create();
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
			this.ry.value = data.sum / 1500;
			// console.log(data.sum);
			this.orbitalControl.ry.value += this.ry.value;	
			this.orbitalControl.radius.value = params.maxRadius + data.sum/200 * 7;
			params.zoom = this.orbitalControl.radius.value;

			if(data.hasBeat) {
				this.rx.setTo(data.sum / 200);
				this.rx.value = 0;
			}
		}

		this.camMovement.value += this.rx.value;
		// console.log(this.camMovement.value, this.rx.value);
		
		mat4.identity(this.mtxModel, this.mtxModel);
		mat4.translate(this.mtxModel, this.mtxModel, [0, params.maxRadius*0.5, 0]);

		this.orbitalControl.rx.value = Math.sin(this.camMovement.value) * 0.1 + 0.1;
		this.orbitalControl.center[1] = params.centery;


		for(let i=0; i<this._particleSets.length; i++) {
			let oSet = this._particleSets[i];
			oSet.count ++;

			if(oSet.count % params.skipCount == 0) {
				oSet.count = 0;
				this.updateFbo(oSet);
			}
		}

		GL.clear(0, 0, 0, 0);
		if(params.showAxis) {
			this._bAxis.draw();	
		}
		
		GL.rotate(this.mtxModel);

		this._bSky.draw(Assets.get('bg'));
		this._vFloor.render();

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


	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
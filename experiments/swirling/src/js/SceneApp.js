// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';
import SoundManager from './SoundManager';

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

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();


		//	views
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();
		this._vFloor  = new ViewFloor();

		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);


		this._fboCurrent.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboCurrent.unbind();

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		this._fboTarget.unbind();

		GL.setMatrices(this.camera);
	}


	updateFbo() {
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(
			this._fboCurrent.getTexture(1), 
			this._fboCurrent.getTexture(0), 
			this._fboCurrent.getTexture(2),
			this._fboCurrent.getTexture(3)
			);
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;

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
			this.orbitalControl.radius.value = 10 + data.sum/200 * 7;
			params.zoom = this.orbitalControl.radius.value;

			if(data.hasBeat) {
				this.rx.setTo(data.sum / 500);
				this.rx.value = 0;
			}
		}

		this.camMovement.value += this.rx.value;
		// console.log(this.camMovement.value, this.rx.value);
		
		mat4.identity(this.mtxModel, this.mtxModel);
		mat4.translate(this.mtxModel, this.mtxModel, [0, params.maxRadius*0.5, 0]);

		this.orbitalControl.rx.value = Math.sin(this.camMovement.value) * 0.1 + 0.1;
		this.orbitalControl.center[1] = params.centery;


		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		let p = this._count / params.skipCount;

		GL.clear(0, 0, 0, 0);
		if(params.showAxis) {
			this._bAxis.draw();	
		}
		
		GL.rotate(this.mtxModel);

		this._vFloor.render();

		this._vRender.render(
			this._fboTarget.getTexture(0), 
			this._fboCurrent.getTexture(0), 
			p, 
			this._fboCurrent.getTexture(2),
			this._fboCurrent.getTexture(3)
			);

		const size = Math.min(params.numParticles, GL.height/4);

		// for(let i=0; i<4; i++) {
		// 	GL.viewport(0, size * i, size, size);
		// 	this._bCopy.draw(this._fboCurrent.getTexture(i));
		// }

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
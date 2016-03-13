// SceneApp.js
import alfrid from './libs/alfrid.js';
import ViewCube from './ViewCube';
import BeatDetector from './BeatDetector';

import ViewSphere from './ViewSphere';
import ViewBall from './ViewBall';
import ViewPost from './ViewPost';
import ViewBox from './ViewBox';
import Ball from './Ball';
import ViewSSAO from './ViewSSAO';

let GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		this._initSound();
		this._initBalls();
		this._rotationY = new alfrid.EaseNumber(0.01, .05);
		this._rotationX = new alfrid.EaseNumber(0.0, .005);

		this.camera.setPerspective(Math.PI/4, GL.aspectRatio, 1, 100);
		this.cameraCube = new alfrid.CameraCube();
		this.orbitalControl.lockZoom(true);

	}


	_initSound() {
		this._beatDetector = new BeatDetector('assets/02.mp3', (sum)=>this._onBeat(sum), false);
	}

	_initBalls() {
		var random = function(min, max) { return min + Math.random() * (max - min);	}

		this._balls = [];
		let range = 2;
		for(let i=0; i<params.numBalls; i++) {
			// let b = {
			// 	position:[random(-range, range), random(-range, range), random(-range, range)],
			// 	scale:random(.5, 1)
			// }

			let b = new Ball();

			this._balls.push(b);
		}
	}


	_initTextures() {
		console.log('Init textures');
		let fboSize        = 512;
		this._cubeFbo      = new alfrid.CubeFrameBuffer(fboSize);
		this._cubeBalls    = new alfrid.CubeFrameBuffer(fboSize);
		this._textureLight = new alfrid.GLTexture(imgStudio);

		this._fboRender    = new alfrid.FrameBuffer(GL.width, GL.height, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
		this._fboSSAO 	   = new alfrid.FrameBuffer(GL.width, GL.height, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
	}


	_initViews() {
		console.log('Init Views');
		this._vCube      = new ViewCube();
		this._bAxis      = new alfrid.BatchAxis();
		this._bDotsPlane = new alfrid.BatchDotsPlane();
		this._bCopy      = new alfrid.BatchCopy();
		this._vBall      = new ViewBall();
		this._vBox 		 = new ViewBox();
		this._vPost      = new ViewPost();
		this._vSSAO 	 = new ViewSSAO(this.camera.projection);
		
		this._vSphere    = new ViewSphere();
	}

	_onBeat(beatAmplitude) {
		this._rotationY.setTo(beatAmplitude * .2);
		this._rotationY.value = 0.01;

		// this._rotationX.setTo(beatAmplitude * .1);
		this._rotationX.value += beatAmplitude * 1.1;
	}

	render() {

		let frequencies = this._beatDetector.frequencies;
		// if(frequencies == undefined) return;

		this.orbitalControl._ry.value -= this._rotationY.value;
		// this.orbitalControl._rx.value = Math.sin(this._rotationX.value) * .7;


		GL.setMatrices(this.cameraCube);
		for(var i=0; i<6; i++) {
			this._cubeFbo.bind(i);
			GL.clear();
			this.cameraCube.face(i);
			this._vSphere.render(this._beatDetector.beatAmplitude);

			this._cubeFbo.unbind();
		}

		GL.setMatrices(this.camera);
		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._vSphere.render(this._beatDetector.beatAmplitude);
		
		for(let i=0; i<this._balls.length; i++) {

			let b = this._balls[i];
			b.update();
			if(i<this._balls.length) {
				this._vBall.render(this._cubeFbo.getTexture(), this._textureLight, b.position, b.scale + this._beatDetector.beatAmplitude * .5, b.axis, b.angle);
			} else {
				this._vBox.render(this._cubeFbo.getTexture(), this._textureLight, b.position, b.scale + this._beatDetector.beatAmplitude * .5, b.axis, b.angle);
			}
			
			
		}
		this._fboRender.unbind();


		//	PREP FOR AO
		let m = this.camera.projection;
		let w = this._fboRender.width;
		let h = this._fboRender.height;
		let p = vec4.create();
		p[0]  = -2 / (w * m[0]);
		p[1]  = -2 / (h * m[5]);
		p[2]  = 1.9 - m[2] / m[0];
		p[3]  = 1.0 + m[6] / m[5];


		GL.setMatrices(this.cameraOrtho);
		
		this._fboSSAO.bind();
		GL.clear(0, 0, 0, 0);
		this._vSSAO.render(this._fboRender.getDepthTexture());
		this._fboSSAO.unbind();

		GL.clear(0, 0, 0, 0);
		this._vPost.render(this._fboRender.getTexture(), this._fboSSAO.getTexture());

	}
}


export default SceneApp;
// SceneApp.js

import alfrid , { Scene } from 'alfrid';
import ViewFloor from './ViewFloor';
import ViewBall from './ViewBall';

const GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this.cameraLight = new alfrid.CameraPerspective();
		this.cameraLight.setPerspective(Math.PI * .125, 1, 0.1, 2000);
		this.orbitalControl.radius.value = 15.0;
		this.orbitalControl.rx.value = 0.4;
		this.orbitalControl.ry.value = 0.4;

		this.shadowMatrix = mat4.create();
		
	}

	_initTextures() {
		console.log('init textures');

		function getAsset(id) {
			for(var i=0; i<assets.length; i++) {
				if(id === assets[i].id) {
					return assets[i].file;
				}
			}
		}


		let o = {
			wrapS:GL.gl.CLAMP_TO_EDGE,
			wrapT:GL.gl.CLAMP_TO_EDGE
		}

		this._textureGold = new alfrid.GLTexture(getAsset('gold'), false, o);
	}


	_initViews() {
		console.log('init views');
		
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vFloor = new ViewFloor();
		this._vBall = new ViewBall();
	}


	render() {
		GL.clear(0, 0, 0, 0);
		// this._bAxis.draw();
		this._bDots.draw();

		if(!this.time) {
			this.time = Math.random();
		} else {
			this.time += 0.003;	
		}
		

		let r = 5;
		let pos = [Math.cos(this.time) * r, 5 + Math.sin(Math.cos(this.time * 5)) * 3, Math.sin(this.time) * r];

		this.cameraLight.lookAt(pos, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
		mat4.multiply(this.shadowMatrix, this.cameraLight.projection, this.cameraLight.viewMatrix);

		if(params.lookFromDot) {
			// GL.setMatrices(this.cameraLight);
			this.camera.lookAt(pos, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
		}

		this._vFloor.render(this.shadowMatrix, this._textureGold, pos);
		this._vBall.render(this.shadowMatrix, this._textureGold, pos);

		let s = .1;
		this._bBall.draw(this.cameraLight.position, [s, s, s], [1, 1, .9])
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
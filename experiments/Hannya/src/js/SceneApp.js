// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewMask from './ViewMask';
import ViewPetals from './ViewPetals';
import ViewSave from './ViewSave';
import ViewSim from './ViewSim';
import Assets from './Assets';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
		this.orbitalControl.radius.value = 8;

		//	CAMERA CUBE
		this.cameraCube = new alfrid.CameraCube();

		this._count = 0;

		this._initBalls();

		this.resize();
	}

	_initTextures() {
		console.log('init textures');

		let fboSize        = 64 * 4;
		this._cubeFbo      = new alfrid.CubeFrameBuffer(fboSize);

		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		const oRender = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
		const numMips = 5;
		for(let i=0; i<numMips; i++) {

		}
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bSky = new alfrid.BatchSkybox();
		this._bBall = new alfrid.BatchBall();

		this._vMask = new ViewMask();
		this._vPetals = new ViewPetals();
		this._vSim 	  = new ViewSim();

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


	_initBalls() {
		const numBalls = 6;
		const m = mat4.create();

		function getPos() {
			let v = vec3.fromValues(0, 0, -random(5, 10));
			mat4.identity(m, m);
			mat4.rotateX(m, m, Math.random() * Math.PI * 2);
			mat4.rotateY(m, m, Math.random() * Math.PI * 2);
			mat4.rotateZ(m, m, Math.random() * Math.PI * 2);
			vec3.transformMat4(v, v, m);

			return v;
		}

		this._balls = [];
		for(let i=0; i<numBalls; i++) {
			const pos = getPos();
			const scale = random(1, 5) * 0.5;
			this._balls.push({
				pos,
				scale
			});
		}

	}


	_getCubeMap() {
		if(this._count % 2 == 0) {
			GL.setMatrices(this.cameraCube);
			for(var i=0; i<6; i++) {
				this._cubeFbo.bind(i);
				GL.clear(0, 0, 0, 0);
				this.cameraCube.face(i);
				this._renderPetals();
				this._cubeFbo.unbind();
			}
		}
		
	}

	updateFbo() {
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0), this._fboCurrent.getTexture(2));
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;

	}


	render() {
		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		this._getCubeMap();


		this._fboRender.bind();

		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);
		this._renderPetals();
		this._vMask.render(Assets.get('studio_radiance'), Assets.get('irr'), this._cubeFbo.getTexture());

		this._fboRender.unbind();


		GL.clear(0, 0, 0, 0);
		this._bCopy.draw(this._fboRender.getTexture());
	}

	_renderPetals() {
		let p = this._count / params.skipCount;
		this._vPetals.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));
	}


	resize() {
		let scale = 1;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
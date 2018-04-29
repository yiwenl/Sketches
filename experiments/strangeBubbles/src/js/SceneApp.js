// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

// import ViewCube from './ViewCube';
import ARVideoRenderer from './ARVideoRenderer';
import { isARKit } from './ARUtils';

import ViewBubble from './ViewBubble';
import ViewMask from './ViewMask';
import ViewBg from './ViewBg';
import ViewDistort from './ViewDistort';
// import ViewAR from './ViewAR';
const ratio = 533/800;

const NUM_BALLS = 6;

var random = function(min, max) { return min + Math.random() * (max - min);	}

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 10;
		this.orbitalControl.radius.limit(8, 15);
		this.camera.setPerspective(45 * Math.PI / 180, GL.aspectRatio, .1, 100);


		this.cameraAR = new alfrid.CameraPerspective();
		this.cameraPortrait = new alfrid.CameraPerspective();
		

		this._mHit = mat4.create();
		this._posSphere = vec3.create();
		this._ori = vec3.create();


		this._hits = [];
		this._posHits = [];
		this._sizes = [];


		if(ARDisplay) {
			this.cameraPortrait.setPerspective(90 * Math.PI / 180, ratio, ARDisplay.depthNear, ARDisplay.depthFar);
			this._frameData = new VRFrameData();
			// mat4.translate(this._mHit, this._mHit, vec3.fromValues(999, 999, 999));

			for(let i=0; i<NUM_BALLS; i++) {
				const v = vec3.fromValues(999, 999, 999);
				this._posHits.push(v);
				const m = mat4.create();
				mat4.translate(m, m, this._posHits);
				this._hits.push(m);

				const s = new alfrid.EaseNumber(0, random(.05, .15));
				this._sizes.push(s);
				setTimeout(()=> {
					s.value = 1;
				}, Math.random() * 500);
			}

		} else {
			let r = 5;
			for(let i=0; i<NUM_BALLS; i++) {
				const v = vec3.fromValues(random(-r, r), random(-r, r), random(-r, r));
				this._posHits.push(v);
				const m = mat4.create();
				mat4.translate(m, m, v);
				this._hits.push(m);
				this._sizes.push(new alfrid.EaseNumber(0));
			}
		}

		GL.canvas.addEventListener('touchstart', (e)=>this._onClick(e));

		this.portraitMatrix = mat4.create();
		this.biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

	}

	_initTextures() {
		// console.log('init textures');

		const s = 512;
		this._fboMask = new alfrid.FrameBuffer(s, s);

		this._fboBg = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		// this._bSky = new alfrid.BatchSkybox();

		// this._vModel = new ViewObjModel();

		// this._vCube = new ViewCube();
		if(ARDisplay) {
			this._vAR = new ARVideoRenderer(ARDisplay, GL.gl);	
		}


		this._vBubble = new ViewBubble();

		this._vMask = new ViewMask();

		this._vBg = new ViewBg();

		this._vDistort = new ViewDistort();
		
		// this._vCylinder = new ViewCylinder();
		// this._vAR = new ViewAR();

		if(!ARDisplay) {
			setInterval(()=> {
				let r = 5;
				const pos = vec3.fromValues(random(-r, r), random(-r, r), random(-r, r));
				this.createBubble(pos);
			}, 3000);	
		}
		
	}


	_onClick(e) {
		const { pose } = this._frameData;

		const pos = vec3.clone(pose.position);

		this.createBubble(pos);
	}


	createBubble(pos) {
		const vPos = this._posHits.shift();
		const mPos = this._hits.shift();
		const size = this._sizes.shift();
		size.value = 1;
		this._sizes[0].value = 0;


		vec3.copy(vPos, pos);
		
		mat4.identity(mPos, mPos);
		mat4.translate(mPos, mPos, pos);

		this._posHits.push(vPos);
		this._hits.push(mPos);
		this._sizes.push(size);

		console.log(this._sizes.length);
	}



	render() {
		const camPos = vec3.create();;
		const vDir = vec3.create();
		// console.log(this.camera.position);
		
		if(ARDisplay) {
			ARDisplay.getFrameData(this._frameData);
			const dir = 'left';
			const projection = this._frameData[`${dir}ProjectionMatrix`];
			const matrix = this._frameData[`${dir}ViewMatrix`];	

			mat4.copy(this.cameraAR.matrix, matrix);
			mat4.copy(this.cameraAR.projection, projection);
			GL.setMatrices(this.cameraAR);

			const { pose } = this._frameData;
			vec3.copy(camPos, pose.position);
		} else {
			vec3.copy(camPos, this.camera.position);
		}
		
		GL.clear(0, 0, 0, 0);

		if(ARDisplay) {
			if (isARKit(this.vrDisplay) && !window.WebARonARKitSendsCameraFrames) {
	      		// return;
	    	} else {
	    		this._fboBg.bind();
	    		GL.clear(0, 0, 0, 0);
	    		this._vAR.render();
	    		this._fboBg.unbind();
	    	}	

	    	
		} else {
			this._fboBg.bind();
			GL.clear(0, 0, 0, 0);
			this._vBg.render();
			this._fboBg.unbind();
		}

		

		this._fboMask.bind();
		GL.clear(0, 0, 0, 1);

		GL.enableAdditiveBlending();
		GL.disable(GL.DEPTH_TEST);
		this._hits.forEach( (m, i) => {
			vec3.sub(vDir, camPos, this._posHits[i]);
			vec3.normalize(vDir, vDir);
			GL.rotate(m);
			this._vMask.render(vDir, this._sizes[i].value);
		});

		GL.enableAlphaBlending();
		
		this._fboMask.unbind();


		GL.rotate(this._mHit);

		this._vDistort.render(this._fboBg.getTexture(), this._fboMask.getTexture());
		// this._bCopy.draw(this._fboBg.getTexture());
		// this._bCopy.draw(this._fboMask.getTexture());

		GL.enable(GL.DEPTH_TEST);
		this._hits.forEach( (m, i) => {
			vec3.sub(vDir, camPos, this._posHits[i]);
			vec3.normalize(vDir, vDir);
			GL.rotate(m);
			this._vBubble.render(this._fboBg.getTexture(), vDir, this._sizes[i].value);
		})
		// this._vBubble.render();

		// this._hits.forEach
		
	}



	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
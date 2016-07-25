// SceneApp.js

import alfrid, { Scene, GL, Ray } from 'alfrid';
import ViewAddVel from './ViewAddVel';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewHit from './ViewHit';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 10;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;

		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this.hit = [999, 999, 999];
		this.touchCount = 0;

		this._isTouching = GL.isMobile ? false : true;

		GL.canvas.addEventListener('touchstart', ()=> {
			this._isTouching = true;
		})

		GL.canvas.addEventListener('mousemove', (e)=>this._onMove(e));
		GL.canvas.addEventListener('touchmove', (e)=>this._onMove(e));
		GL.canvas.addEventListener('touchend', ()=> {
			this.touchCount = 0;
			this._isTouching = false;
		});
		GL.canvas.addEventListener('mouseup', ()=> {
			this.touchCount = 0;
		});
	}

	_initTextures() {
		console.log('init textures', GL.HALF_FLOAT);

		//	FBOS
		const numParticles = params.numParticles;
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
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();


		//	views
		this._vAddVel = new ViewAddVel();
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();
		this._vHit = new ViewHit();

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

	_onMove(e) {
		let mx, my;
		if(e.touches) {
			mx = (e.touches[0].pageX / GL.width) * 2.0 - 1.0;
			my = - (e.touches[0].pageY / GL.height) * 2.0 + 1.0;
		} else {
			mx = (e.clientX / GL.width) * 2.0 - 1.0;
			my = - (e.clientY / GL.height) * 2.0 + 1.0;	
		}
		
		this.camera.generateRay([mx, my, 0], this._ray);
		const mesh = this._vHit.mesh;
		const faceVertices = mesh.faces.map((face)=>(face.vertices));
		const offset = 0;
		let v0, v1, v2;
		let hit = [999, 999, 999];

		for(let i = 0; i < faceVertices.length; i++) {
			const vertices = faceVertices[i];
			v0 = [vertices[0][0], vertices[0][1]+offset, vertices[0][2]];
			v1 = [vertices[1][0], vertices[1][1]+offset, vertices[1][2]];
			v2 = [vertices[2][0], vertices[2][1]+offset, vertices[2][2]];

			hit = this._ray.intersectTriangle(v0, v1, v2);
			if(hit) {
				break;
			}
		}

		if(hit) {
			this.hit = hit;
		} else {
			this.touchCount = 0;
		}

		// this.hit = hit || [999, 999, 999];
	}


	updateFbo() {
		//	Update Velocity : bind target Velocity, render simulation with current velocity / current position
		this._fboTargetVel.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrentVel.getTexture(), this._fboCurrentPos.getTexture(), this._fboExtra.getTexture(), this.hit, this.touchCount);
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


	render() {
		if(this._isTouching) {
			this.touchCount ++;
		}

		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		let p = this._count / params.skipCount;

		GL.clear(0, 0, 0, 0);

		this._vRender.render(this._fboTargetPos.getTexture(), this._fboCurrentPos.getTexture(), p, this._fboExtra.getTexture());
		// this._vHit.render();

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
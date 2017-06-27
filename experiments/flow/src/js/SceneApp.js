// SceneApp.js

import alfrid, { Scene, GL, Ray } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewHitPlane from './ViewHitPlane';


function getMouse(e) {
	if(e.touches) {
		return {x:e.touches[0].pageX, y:e.touches[0].pageY};
	} else {
		return {x:e.clientX, y:e.clientY};
	}
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/3, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 13;
		this.orbitalControl.lockZoom(true);

		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this._hit = vec3.create();
		this._hitForce = new alfrid.EaseNumber(0);
		this.autoMove = true;
		this.time = 0;
		gui.add(this, 'autoMove');


		const numParticles = params.numParticles;
		const arraysize = numParticles * numParticles * 4;
		this._pixels = new Float32Array(arraysize);

		this._isSending = false;
		this._frameCount = 0;

		gui.add(this, '_sendFrame');
		gui.add(this, '_readPositions');
		gui.add(this, 'startTransmit');

		window.addEventListener('mousemove', (e)=>this._onMove(e));
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._vHit = new ViewHitPlane();


		//	views
		this._vRender = new ViewRender();
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

	_sendFrame() {
		console.log('Send Frame', this.currFrame);
		socket.emit('frame', this.currFrame);
		this.currFrame ++;

		// alfrid.Scheduler.next(()=> this._sendCenter());
		alfrid.Scheduler.delay(()=> this._sendCenter(), null, 100);
	}


	_sendCenter() {
		console.log('Send Center');
		socket.emit('sphere', [this._hit[0], this._hit[1], this._hit[2]]);

		// alfrid.Scheduler.next(()=> this._readPositions());
		alfrid.Scheduler.delay(()=> this._readPositions(), null, 100);
	}


	_readPositions() {
		console.log('Send Position');
		this._fboTarget.bind();
		GL.gl.readPixels(0, 0, params.numParticles, params.numParticles, GL.gl.RGBA, GL.gl.FLOAT, this._pixels);
		this._fboTarget.unbind();

		const positions = [];
		for(let i=0; i<this._pixels.length; i+=4) {
			positions.push(this._pixels[i]);
			positions.push(this._pixels[i+1]);
			positions.push(this._pixels[i+2]);
		}

		socket.emit('position', positions);

		// alfrid.Scheduler.next(() => this._sendCenter());
		alfrid.Scheduler.delay(()=>this.toRender(), null, 1000);
	}


	startTransmit() {
		this._isSending = true;
		this._frameCount = 0;
		this.currFrame = 0;
		const fps = 2;
		// this._interval = setInterval(()=>this.toRender(), 1000/fps);

		this.toRender();
	}

	_onMove(e) {
		const o = getMouse(e);

		const mx = (o.x / GL.width) * 2.0 - 1.0;
		const my = - (o.y / GL.height) * 2.0 + 1.0;

		this.camera.generateRay([mx, my, 0], this._ray);

		if(!this.faceVertices) {
			const mesh = this._vHit.mesh;
			mesh.generateFaces();
			this.faceVertices = mesh.faces.map((face)=>(face.vertices));
		}


		let hit;
		const offset = 1.01;
		let v0, v1, v2;
		// const m = mat4.create();
		const v = vec3.create();
		const m = GL._inverseModelViewMatrix;

		function rotate(vec) {
			vec3.copy(v, vec);
			vec3.transformMat3(v, v, m);
			return vec3.clone(v);
		}

		for(let i = 0; i < this.faceVertices.length; i++) {
			const vertices = this.faceVertices[i];
			v0 = rotate(vertices[0]);
			v1 = rotate(vertices[1]);
			v2 = rotate(vertices[2]);

			hit = this._ray.intersectTriangle(v0, v1, v2);
			if(hit) {	break;	}
		}

		if(hit) {
			this._hitForce.value = 1;
			vec3.copy(this._hit, hit);
		} else {
			this._hitForce.value = 0;
		}

	}


	updateFbo() {
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0), this._fboCurrent.getTexture(2), this._hit, this._hitForce.value);
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;

	}


	render() {
		if(!this._isSending) {
			this.toRender();
		}
	}


	toRender() {
		this.time += 0.01;

		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		let p = this._count / params.skipCount;

		GL.clear(0, 0, 0, 0);
		this._bDots.draw();
		// this._vHit.render();

		if(this.autoMove) {
			this._hitForce.value = 1;
			this._hit[0] = Math.cos(this.time) * 2;
			this._hit[1] = Math.sin(this.time) * 2;
			this._hit[2] = 0;
		}



		const s = this._hitForce.value * 1.5;
		this._bBall.draw(this._hit, [s, s, s]);

		this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));


		this._frameCount ++;
		const totalFrame = 300;
		

		if(this._isSending) {
			if(this._frameCount <= totalFrame) {
				this._sendFrame();
			}
		}
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
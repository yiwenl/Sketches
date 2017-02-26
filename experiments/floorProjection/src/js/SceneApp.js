// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import VIVEUtils from './utils/VIVEUtils';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';
import ViewCursor from './ViewCursor';
import ViewLine from './ViewLine';
import VIVEGamePads from './utils/VIVEGamePads';

import ViewBlocks from './ViewBlocks';

const scissor = function(x, y, w, h) {
	GL.scissor(x, y, w, h);
	GL.viewport(x, y, w, h);
}

const RAD = Math.PI / 180;


const distance = function(a, b) {
	return vec3.dist(a, b);
}

class SceneApp extends Scene {
	constructor() {
		super();
		
		//	ORBITAL CONTROL
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
		this.camera.setPerspective(30 * RAD, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 10;

		//	PARTICLES
		this._count = 0;
		this.lastHit = vec3.fromValues(-999, -999, -999);

		//	VR CAMERA
		this.cameraVR = new alfrid.Camera();

		//	MODEL MATRIX
		this._modelMatrix = mat4.create();
		console.log('Has VR :', VIVEUtils.hasVR);

		if(VIVEUtils.hasVR) {
			mat4.translate(this._modelMatrix, this._modelMatrix, vec3.fromValues(0, 0, 0));
			GL.enable(GL.SCISSOR_TEST);

			this._gamepads = new VIVEGamePads(this._vFloor.mesh, this._modelMatrix);
			this._gamepads.on('clear', ()=> {
				this._vBlocks.reset();
			});

			this.toRender();

			this.resize();
		}

		this.toggle = true;
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.gl.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();

		this._vFloor = new ViewFloor();
		this._vCursor = new ViewCursor();
		this._vLine = new ViewLine();
		this._vBlocks = new ViewBlocks();

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
		if(!VIVEUtils.hasVR) { this.toRender(); }
	}


	toRender() {
		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		if(VIVEUtils.hasVR) {	VIVEUtils.vrDisplay.requestAnimationFrame(()=>this.toRender());	}		


		if(VIVEUtils.hasVR) {
			VIVEUtils.getFrameData();
			const w2 = GL.width/2;
			VIVEUtils.setCamera(this.cameraVR, 'left');

			scissor(0, 0, w2, GL.height);
			GL.setMatrices(this.cameraVR);
			GL.rotate(this._modelMatrix);
			this.renderScene();


			VIVEUtils.setCamera(this.cameraVR, 'right');
			scissor(w2, 0, w2, GL.height);
			GL.setMatrices(this.cameraVR);
			GL.rotate(this._modelMatrix);
			this.renderScene();

			VIVEUtils.submitFrame();

			//	re-render whole
			scissor(0, 0, GL.width, GL.height);

			GL.clear(0, 0, 0, 0);
			mat4.copy(this.cameraVR.projection, this.camera.projection);

			GL.setMatrices(this.cameraVR);
			GL.rotate(this._modelMatrix);
			this.renderScene();

		} else {
			GL.setMatrices(this.camera);
			GL.rotate(this._modelMatrix);
			this.renderScene();
		}
	}


	renderScene() {
		GL.clear(1, 1, 1, 1);
		GL.clear(0, 0, 0, 1);

		GL.rotate(this._modelMatrix);

		let p = this._count / params.skipCount;

		// this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));

		if(VIVEUtils.hasVR) {

			const s = 0.03;
			this._bBall.draw(this._gamepads.hit, [s*2, s*2, s*2], [1.0, 0.573, 0.596], .7);	

			const { position, hit, hasHit, isButtonPressed} = this._gamepads;

			// console.log('has hit : ', hasHit, isButtonPressed);

			const controllerPos = vec3.clone(position);
			controllerPos[1] = 0;
			// this._bBall.draw(controllerPos, [s, s, s], [1, 0, 0], 1);

			if(hasHit && isButtonPressed) {
				let _hit = vec3.clone(hit);
				if(distance(hit, this.lastHit) > .02) {
					this._vBlocks.addBlock(_hit, this.toggle);
					this.toggle = !this.toggle;
					vec3.copy(this.lastHit, _hit);
				}
				
			}

			// this._vLine.render(position, hit);

			// GL.disable(GL.CULL_FACE);
			// this._vCursor.render(this._gamepads.position, this._gamepads.quat, this._gamepads.isButtonPressed);
			// GL.enable(GL.CULL_FACE);	
		}
		
		// this._vFloor.render();

		this._vBlocks.render(Assets.get('studio_radiance'), Assets.get('irr'));
	}


	resize() {
		const scale = VIVEUtils.hasVR ? 2 : 1;
		GL.setSize(window.innerWidth * scale, window.innerHeight * scale);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
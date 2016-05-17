// SceneApp.js

import alfrid , { Scene, GL } from 'alfrid';
import ViewTerrain from './ViewTerrain';
import ViewTree from './ViewTree';
import ViewDome from './ViewDome';
import ViewAddVel from './ViewAddVel';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewAddLife from './ViewAddLife';
import ViewShadow from './ViewShadow';
import SubsceneSnow from './SubsceneSnow';

const RAD = Math.PI/180;
var random = function(min, max) { return min + Math.random() * (max - min);	}
window.getAsset = function(id) {
	for(var i=0; i<assets.length; i++) {
		if(id === assets[i].id) {
			return assets[i].file;
		}
	}
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.camera.setPerspective(70 * RAD, GL.aspectRatio, .1, 30);
		let v = vec3.fromValues(-3, .37, -2);
		this.orbitalControl.radius.setTo(5);
		this.orbitalControl.radius.value = 4.02;

		this.orbitalControl.center[1] = 1.35;
		this.orbitalControl.positionOffset[1] = 0.25;
		this.orbitalControl.rx.value = .1;
		this.orbitalControl.rx.limit(.1, .15);
		this.orbitalControl.lockZoom(true);

		this._seasonIndex = 3;
		this._count = 0;
		this._hasCreateParticles = false;

		//	SHADOW
		this.lightPosition = [.5, 5, 1.5];
		this.shadowMatrix  = mat4.create();
		
		this.cameraLight   = new alfrid.CameraPerspective();
		this.cameraLight.setPerspective(90*RAD, 1.0, .5, 30);
		this.cameraLight.lookAt(this.lightPosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
		this.startDirection = vec3.fromValues(0, 1, 0);
		mat4.multiply(this.shadowMatrix, this.cameraLight.projection, this.cameraLight.viewMatrix);

		window.addEventListener('keydown', (e)=>this._onKey(e));
		window.addEventListener('mousedown', (e) => {
			this.orbitalControl.ry.easing = 0.1;
		})
	}

	_initTextures() {
		this._textureAOTerrain = new alfrid.GLTexture(getAsset('aoTerrain'));
		this._textureAOTree = new alfrid.GLTexture(getAsset('aoTree'));

		let tWinter = new alfrid.GLTexture(getAsset('winter'));
		let tSpring = new alfrid.GLTexture(getAsset('spring'));
		let tSummer = new alfrid.GLTexture(getAsset('summer'));
		let tFall = new alfrid.GLTexture(getAsset('fall'));

		this._textureSeasons = [tWinter, tSpring, tSummer, tFall];

		//	particles
		const numParticles = params.numParticles;
		const o = { minFilter:GL.NEAREST, magFilter:GL.NEAREST };

		this._fboCurrentPos = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboInitPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboCurrentLife = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetLife  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboCurrentVel = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetVel  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboExtra  	= new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboShadowMap = new alfrid.FrameBuffer(1024, 1024);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();

		this._vTerrain = new ViewTerrain();
		this._vTree = new ViewTree();
		this._vDome = new ViewDome();

		this._vAddVel = new ViewAddVel();
		this._vAddLife = new ViewAddLife();
		this._vRender = new ViewRender();
		this._vSim 	  = new ViewSim();
		this._vShadow = new ViewShadow();

		this._snow = new SubsceneSnow(this, this._bCopy);
	}


	_initParticles() {
		console.debug('init particles');
		this._vSave = new ViewSave(this._vTree.vertices);
		GL.setMatrices(this.cameraOrtho);

		this._fboCurrentPos.bind();
		this._vSave.render(0);
		this._fboCurrentPos.unbind();

		this._fboExtra.bind();
		this._vSave.render(1);
		this._fboExtra.unbind();

		this._fboCurrentLife.bind();
		this._vSave.render(2);
		this._fboCurrentLife.unbind();


		this._fboTargetPos.bind();
		this._bCopy.draw(this._fboCurrentPos.getTexture());
		this._fboTargetPos.unbind();

		this._fboInitPos.bind();
		this._bCopy.draw(this._fboCurrentPos.getTexture());
		this._fboInitPos.unbind();

		GL.setMatrices(this.camera);
		this._hasCreateParticles = true;
	}


	_onKey(e) {
		console.log(e.keyCode);
		if(e.keyCode === 32) {
			this._seasonIndex ++;
			if(this._seasonIndex >=4) this._seasonIndex = 0;
			let s = vec3.fromValues(random(-1, 1), 1, random(-1, 1));
			vec3.normalize(s, s);
			this.startDirection = vec3.clone(s);
			vec3.scale(s, s, params.domeRadius);
			vec3.scale(this.startDirection, this.startDirection, 2.0);

			this._vDome.open(s);
			this.orbitalControl.ry.easing = 0.0075;
			this.orbitalControl.ry.value += Math.PI;

			let opacity = (this._seasonIndex == 3) ? 0.0 : 1.0;
			params.particleOpacity.value = opacity;
		}
	}


	updateFbo() {
		//	Update Velocity : bind target Velocity, render simulation with current velocity / current position
		this._fboTargetVel.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrentVel.getTexture(), this._fboCurrentPos.getTexture(), this._fboExtra.getTexture(), this._fboCurrentLife.getTexture() );
		this._fboTargetVel.unbind();

		//	Update position : bind target Position, render addVel with current position / target velocity;
		this._fboTargetPos.bind();
		GL.clear(0, 0, 0, 1);
		this._vAddVel.render(this._fboCurrentPos.getTexture(), this._fboTargetVel.getTexture(), this._fboCurrentLife.getTexture(), this._fboInitPos.getTexture());
		this._fboTargetPos.unbind();

		//	Update life
		this._fboTargetLife.bind();
		GL.clear(0, 0, 0, 1);
		this._vAddLife.render(this._fboCurrentLife.getTexture());
		this._fboTargetLife.unbind();

		//	SWAPPING : PING PONG
		let tmpVel          = this._fboCurrentVel;
		this._fboCurrentVel = this._fboTargetVel;
		this._fboTargetVel  = tmpVel;

		let tmpPos          = this._fboCurrentPos;
		this._fboCurrentPos = this._fboTargetPos;
		this._fboTargetPos  = tmpPos;

		let tmpLife          = this._fboCurrentLife;
		this._fboCurrentLife = this._fboTargetLife;
		this._fboTargetLife  = tmpLife;

	}

	render() {
		
		params.time += 0.01;
		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		if(!this._hasCreateParticles && this._vTree.mesh) {
			this._initParticles();

			document.body.classList.remove('isLoading');
		}

		let p = this._count/params.skipCount;

		GL.clear(0, 0, 0, 0);

		if(params.renderEnvironment) {
			this._vDome.render(this.currentSeasonTexture, this.nextSeasonTexture);
			this._vTerrain.render(this.currentSeasonTexture, this.nextSeasonTexture, this._textureAOTerrain);
			this._vTree.render(this.currentSeasonTexture, this.nextSeasonTexture, this._textureAOTree);	
		}

		if(params.renderParticles) {
			this._fboShadowMap.bind();
			GL.clear(0, 0, 0, 0);
			GL.setMatrices(this.cameraLight);
			this._vRender.render(this._fboTargetPos.getTexture(), this._fboCurrentPos.getTexture(), p, this._fboExtra.getTexture(), this._fboCurrentLife.getTexture());	
			this._fboShadowMap.unbind();

			GL.setMatrices(this.camera);
			this._vShadow.render(this._fboTargetPos.getTexture(), this._fboCurrentPos.getTexture(), p, this._fboExtra.getTexture(), this._fboCurrentLife.getTexture(), this._fboShadowMap.getDepthTexture(), this.shadowMatrix, this.currentColor, this.nextColor, this.startDirection);
		}

		this._snow.render();

		/*/
		GL.disable(GL.DEPTH_TEST);
		const size = 500/2;
		GL.viewport(0, 0, size, size);
		this._bCopy.draw(this._fboShadowMap.getDepthTexture());
		GL.enable(GL.DEPTH_TEST);
		//*/
	}


	get color() {
		function mix(a, b, p) { return a * (1.0 - p) + b * p; }
		return [
			mix(this.currentColor[0], this.nextColor[0], params.offset),
			mix(this.currentColor[1], this.nextColor[1], params.offset),
			mix(this.currentColor[2], this.nextColor[2], params.offset)
		]
	}


	
	get currentColor() { return colors[this._seasonIndex]; }
	get nextColor() { return colors[this.nextIndex]; }
	get currentSeasonTexture() { return this._textureSeasons[this._seasonIndex]; }
	get nextSeasonTexture() { return this._textureSeasons[this.nextIndex]; }

	get nextIndex() {
		let index = this._seasonIndex + 1;
		if(index>=4) { index = 0; }
		return index;
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
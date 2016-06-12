// SceneApp.js

import alfrid, { Scene } from 'alfrid';
import ViewDots from './ViewDots';
import ViewNoise from './ViewNoise';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewAddVel from './ViewAddVel';
import ViewSimulation from './ViewSimulation';

const GL = alfrid.GL;
const num = 8;
console.log( num * 256 * 256);
window.getAsset = function(id) {	return assets.find( (a) => a.id === id).file;	}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.time = 0;
		this._count = 0;

		this.cameraPos = { x:0.1, y:0.1, z:0.1};
		// const range = 30;
		// this.fCamera = gui.addFolder('camera position');
		// this.fCamera.add(this.cameraPos, 'x', -range, range).listen();
		// this.fCamera.add(this.cameraPos, 'y', -range, range).listen();
		// this.fCamera.add(this.cameraPos, 'z', -range, range).listen();
		// this.fCamera.open();
	}

	_initTextures() {
		// console.log('init textures');
		this._textureMap      = new alfrid.GLTexture(getAsset('map'));
		this._textureLightMap = new alfrid.GLTexture(getAsset('lightmap'));
		const fboNoiseSize 	  = 512;
		this._fboNoise = new alfrid.FrameBuffer(fboNoiseSize, fboNoiseSize);

		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		};

		this._fboCurrentPos = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboOriginPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboCurrentVel = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetVel  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboExtra  	= new alfrid.FrameBuffer(numParticles, numParticles, o);
	}


	_initViews() {
		this._bCopy   = new alfrid.BatchCopy();
		this._bAxis   = new alfrid.BatchAxis();
		this._bDots   = new alfrid.BatchDotsPlane();
		this._bBall   = new alfrid.BatchBall();
		
		this._vDots   = new ViewDots();
		this._vNoise  = new ViewNoise();
		
		this._vAddVel = new ViewAddVel();
		this._vRender = new ViewRender();
		this._vSim    = new ViewSimulation();
		
		this._vSave   = new ViewSave(this._vDots);
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

		this._fboOriginPos.bind();
		this._bCopy.draw(this._fboCurrentPos.getTexture());
		this._fboOriginPos.unbind();

		GL.setMatrices(this.camera);

		this.debug = false;
		gui.add(this, 'debug');
	}


	updateFbo() {
		//	Update Velocity : bind target Velocity, render simulation with current velocity / current position
		this._fboTargetVel.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrentVel.getTexture(), this._fboCurrentPos.getTexture(), this._fboExtra.getTexture());
		this._fboTargetVel.unbind();

		//	Update position : bind target Position, render addVel with current position / target velocity;
		this._fboTargetPos.bind();
		GL.clear(0, 0, 0, 1);
		this._vAddVel.render(this._fboCurrentPos.getTexture(), this._fboTargetVel.getTexture(), this._fboOriginPos.getTexture());
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
		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		let p = this._count / params.skipCount;

		GL.clear(0, 0, 0, 0);

		//	noise
		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render();
		this._fboNoise.unbind();

		this.time += 0.001;
		const r = 0;
		const x = Math.cos(this.time) * r;
		const z = Math.sin(this.time) * r;
		this.orbitalControl.center[0] = x;
		this.orbitalControl.center[2] = z;
		this.orbitalControl.positionOffset[0] = x;
		this.orbitalControl.positionOffset[2] = z;
		this.cameraPos.x = this.camera.position[0] + this.orbitalControl.positionOffset[0];
		this.cameraPos.y = this.camera.position[1] + this.orbitalControl.positionOffset[1];
		this.cameraPos.z = this.camera.position[2] + this.orbitalControl.positionOffset[2];
		const cameraPos = [this.cameraPos.x, this.cameraPos.y, this.cameraPos.z];

		const s = .3/2;
		let c0 = [1, 0.25, 0.5];
		let c1 = [0.5, 0.5, .5];
		let c2 = [1, 0.0, 0.15];
		
		for(let j=0; j<num; j++) {
			for(let i=0; i<num; i++) {
				const o = this._vDots.render(this._textureMap, [i/num, j/num], num, this._fboNoise.getTexture(), cameraPos);
				// this._bBall.draw(o.pos, [s, s, s], o.near ? c0 : c1);

				if(this.debug) {
					if(o.dist < this._vDots.near) {
						this._bBall.draw(o.pos, [s, s, s], c0);
					} else if(o.dist < this._vDots.far) {
						this._bBall.draw(o.pos, [s, s, s], c1);
					} else {
						this._bBall.draw(o.pos, [s, s, s], c2);
					}	
				}
				
			}
		}

		this._vRender.render(this._fboTargetPos.getTexture(), this._fboCurrentPos.getTexture(), p, this._fboExtra.getTexture());
/*
		const size = 200;
		GL.viewport(0, 0, size, size);
		this._bCopy.draw(this._fboCurrentPos.getTexture());

		GL.viewport(size, 0, size, size);
		this._bCopy.draw(this._fboTargetVel.getTexture());

		GL.viewport(size*2, 0, size, size);
		this._bCopy.draw(this._fboExtra.getTexture());

		
		const size = 150;
		GL.viewport(0, 0, size, size*2);
		this._bCopy.draw(this._textureMap);
*/
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
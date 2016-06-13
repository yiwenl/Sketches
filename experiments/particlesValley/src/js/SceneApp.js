// SceneApp.js

import alfrid, { Scene, Ray } from 'alfrid';
import ViewDots from './ViewDots';
import ViewNoise from './ViewNoise';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewAddVel from './ViewAddVel';
import ViewSimulation from './ViewSimulation';
import ViewFxaa from './ViewFxaa';
import ViewChroma from './ViewChroma';
import ViewHitPlane from './ViewHitPlane';

const GL = alfrid.GL;
const IS_MOBILE = GL.isMobile;
const num = 8;
window.getAsset = function(id) {	return assets.find( (a) => a.id === id).file;	}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		GL.enableAlphaBlending();
		this.time = 0;
		this._count = 0;
		this.setState(0);
		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this.cameraPos = { x:0.1, y:0.1, z:0.1};

		GL.canvas.addEventListener('mousedown', (e)=>this._onDown(e));
		GL.canvas.addEventListener('touchstart', (e)=>this._onDown(e));
	}

	_initTextures() {
		// console.log('init textures');
		this._textureMap      = new alfrid.GLTexture(getAsset('map'));
		this._textureLightMap = new alfrid.GLTexture(getAsset('lightmap'));
		const fboNoiseSize 	  = IS_MOBILE ? 64 : 256;
		this._fboNoise = new alfrid.FrameBuffer(fboNoiseSize, fboNoiseSize);

		if (!IS_MOBILE) {
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

			this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
			this._fboChroma = new alfrid.FrameBuffer(GL.width, GL.height);	
		}
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
		this._vChroma = new ViewChroma();
		this._vFxaa   = new ViewFxaa();
		this._vHit 	  = new ViewHitPlane();
		

		if (!IS_MOBILE) {
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
		}
		

		this.debug = false;
		this.post = false;
		// gui.add(this, 'debug');
	}

	_onDown(e) {
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
		const offset = 1;
		let v0, v1, v2;
		let hit;

		for(let i = 0; i < faceVertices.length; i++) {
			const vertices = faceVertices[i];
			v0 = [vertices[0][0], vertices[0][1]+offset, vertices[0][2]];
			v1 = [vertices[1][0], vertices[1][1]+offset, vertices[1][2]];
			v2 = [vertices[2][0], vertices[2][1]+offset, vertices[2][2]];

			hit = this._ray.intersectTriangle(v0, v1, v2);
			if(hit) {	break;	}
		}

		if(hit) {
			this._vDots.addWave(vec3.clone(hit));
		}
	}

	setState(state) {
		if(IS_MOBILE) {
			this.orbitalControl.rx.value = 0.3;
			this.orbitalControl.rx.limit(0.2, Math.PI/2);
		} else {
			this.state = state;
			if(state === 0) {
				this.orbitalControl.rx.value = 0.3;
				this.orbitalControl.rx.limit(0.1, Math.PI/2 * .3);
				this.orbitalControl.radius.limit(7, 13);
				this.orbitalControl.lockZoom(false);
				this._vDots.near = 10.1;
				this._vDots.far = 15.1;
			} else {
				this.orbitalControl.rx.limit(Math.PI/2-.1, Math.PI/2);
				this.orbitalControl.rx.value = Math.PI/2;
				this.orbitalControl.radius.value = 11;
				this._vDots.near = 1.1;
				this._vDots.far = 25.1;
				
				this.orbitalControl.lockZoom(true);
			}
		}
		
	}


	updateFbo() {
		if (IS_MOBILE) {
			return;
		}
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


		if(this.post) {
			this._fboRender.bind();
			GL.clear(0, 0, 0, 0);	
		}
		

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

		if (!IS_MOBILE) {
			this._vRender.render(this._fboTargetPos.getTexture(), this._fboCurrentPos.getTexture(), p, this._fboExtra.getTexture());		
		}
		

		if (this.post) {
			this._fboRender.unbind();

			this._fboChroma.bind();
			GL.clear(0, 0, 0, 0);
			this._vChroma.render(this._fboRender.getTexture());
			this._fboChroma.unbind();

			this._vFxaa.render(this._fboChroma.getTexture());	
		}
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
// SceneParticle.js
import alfrid, { GL } from 'alfrid';
import ViewSave from './particles/ViewSave';
import ViewAddVel from './particles/ViewAddVel';
import ViewRender from './particles/ViewRender';
import ViewSim from './particles/ViewSim';
import ViewFloor from './ViewFloor';
import ViewDome from './ViewDome';
import ViewPost from './ViewPost';

window.getAsset = function (id) {	return window.assets.find((a) => a.id === id).file;	};

window.params = {
	numParticles: GL.isMobile ? 24 : 100,
	skipCount:10,
	maxRadius: GL.isMobile ? 4 : 7,
	range:1.2,
	speed:1.5,
	focus:.79,
	minThreshold:.50,
	maxThreshold:.80,
	isInvert:false,
};

class SceneParticle extends alfrid.Scene {
	constructor() {
		super();

		this._count = 0;
		GL.enableAlphaBlending();
		this.camera.setPerspective(Math.PI * .65, GL.aspectRatio, 1, 100);
		this.orbitalControl.rx.value = 0.0;
		this.orbitalControl.rx.limit(0, .36);
		this.orbitalControl.radius.setTo(10);
		this.orbitalControl.radius.value = 8;
		this.orbitalControl.radius.limit(1, 11);
		this.orbitalControl.center[1] = 3;
		this.orbitalControl.positionOffset[1] = -.5;

		window.addEventListener('keydown', (e)=>{
			if(e.keyCode == 32) {
				//	SPACE KEY TO TOGGLE COLOUR THEME
				params.isInvert = !params.isInvert;
			}
		});
	}


	_initTextures() {
		const numParticles = params.numParticles;
		const extHalfFloat = GL.getExtension('OES_texture_half_float');
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:extHalfFloat.HALF_FLOAT_OES,
		};

		this._fboCurrentPos = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboCurrentVel = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetVel  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboExtra  	= new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboSpeed      = new alfrid.FrameBuffer(numParticles, numParticles, o);

		this._fboRender     = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();


		this._vAddVel = new ViewAddVel();
		this._vRender = new ViewRender();
		this._vSim = new ViewSim();
		this._vFloor  = new ViewFloor();
		this._vDome = new ViewDome();
		this._vPost   = new ViewPost();

		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);

		this._fboCurrentPos.bind();
		this._vSave.render(0);
		this._fboCurrentPos.unbind();

		this._fboExtra.bind();
		this._vSave.render(1);
		this._fboExtra.unbind();

		this._fboSpeed.bind();
		this._vSave.render(2);
		this._fboSpeed.unbind();

		this._fboTargetPos.bind();
		this._bCopy.draw(this._fboCurrentPos.getTexture());
		this._fboTargetPos.unbind();

		GL.setMatrices(this.camera);
	}


	updateFbo() {
		// 	Update Velocity : bind target Velocity, render simulation with current velocity / current position
		this._fboTargetVel.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrentVel.getTexture(), this._fboCurrentPos.getTexture(), this._fboExtra.getTexture(), this._fboSpeed.getTexture());
		this._fboTargetVel.unbind();


		//	Update position : bind target Position, render addVel with current position / target velocity;
		this._fboTargetPos.bind();
		GL.clear(0, 0, 0, 1);
		this._vAddVel.render(this._fboCurrentPos.getTexture(), this._fboTargetVel.getTexture());
		this._fboTargetPos.unbind();

		//	SWAPPING : PING PONG
		const tmpVel          = this._fboCurrentVel;
		this._fboCurrentVel = this._fboTargetVel;
		this._fboTargetVel  = tmpVel;

		const tmpPos          = this._fboCurrentPos;
		this._fboCurrentPos = this._fboTargetPos;
		this._fboTargetPos  = tmpPos;

	}


	render() {

		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		const p = this._count / params.skipCount;

		GL.clear(0, 0, 0, 0);

		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._vFloor.render();
		this._vDome.render();
		this._vRender.render(this._fboTargetPos.getTexture(), this._fboCurrentPos.getTexture(), p, this._fboExtra.getTexture());
		this._fboRender.unbind();

		this._vPost.render(this._fboRender.getDepthTexture());	
	}

	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
	}
}


export default SceneParticle;
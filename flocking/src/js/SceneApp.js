// SceneApp.js
import alfrid from './libs/alfrid.js';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSimulation from './ViewSimulation';
import ViewAddVel from './ViewAddVel';

let GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		GL = alfrid.GL;
		GL.enableAlphaBlending();
		super();
	}


	_initTextures() {
		console.log('Init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		}

		function clearFbo(fbo) {
			fbo.bind();
			GL.clear(0, 0, 0, 0);
			fbo.unbind();
		}

		this._fboCurrentPos = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboCurrentVel = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetVel  = new alfrid.FrameBuffer(numParticles, numParticles, o);

		clearFbo(this._fboCurrentPos);
		clearFbo(this._fboTargetPos);
		clearFbo(this._fboCurrentVel);
		clearFbo(this._fboTargetVel);
	}
	

	_initViews() {
		console.log('Init Views');
		this._bAxis      = new alfrid.BatchAxis();
		this._bDotsPlane = new alfrid.BatchDotsPlane();
		this._bCopy 	 = new alfrid.BatchCopy();

		this._vRender	 = new ViewRender();
		this._vSim		 = new ViewSimulation();
		this._vAddVel	 = new ViewAddVel();

		//	SAVE INIT POSITIONS
		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);

		this._fboCurrentPos.bind();
		this._vSave.render();
		this._fboCurrentPos.unbind();

		GL.setMatrices(this.camera);
	}


	updateFbo() {
		//	Update Velocity : bind target Velocity, render simulation with current velocity / current position
		this._fboTargetVel.bind();
		this._vSim.render(this._fboCurrentVel, this._fboCurrentPos);
		this._fboTargetVel.unbind();


		//	Update position : bind target Position, render addVel with current position / target velocity;
		this._fboTargetPos.bind();
		this._vAddVel.render(this._fboCurrentPos, this._fboTargetVel);
		this._fboTargetPos.unbind();

		//	SWAPPING : PING PONG
		function swap(a, b) {
			let tmp = a;
			a = b;
			b = tmp;
		}

		swap(this._fboCurrentPos, this._fboTargetPos);
		swap(this._fboCurrentVel, this._fboTargetVel);

	}


	render() {

		this.orbitalControl._ry.value += -.01;


		this._bAxis.draw();
		this._bDotsPlane.draw();
		this._vRender.render(this._fboCurrentPos.getTexture());


		GL.viewport(0, 0, 256, 256);
		this._bCopy.draw(this._fboCurrentPos.getTexture());
	}

}


export default SceneApp;
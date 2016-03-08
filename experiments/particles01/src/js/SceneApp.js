// SceneApp.js
import alfrid from './libs/alfrid.js';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSimulation from './ViewSimulation';
import ViewPlanes from './ViewPlanes';


let GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		GL = alfrid.GL;
		GL.enableAlphaBlending();
		super();

		this.camera.setPerspective(Math.PI * .5, GL.aspectRatio, 1, 200);
		this.orbitalControl._rx.value = .3;
		this._count = 0;
		this._flip = 0;

		let r = 18;
		this.lightPosition = [0, r, 1];
		this.shadowMatrix  = mat4.create();
		this.cameraLight   = new alfrid.CameraPerspective();
		let fov            = 90*Math.PI/180;
		let near           = 1;
		let far            = 400;
		this.cameraLight.setPerspective(fov*3, GL.aspectRatio, near, far);
		this.cameraLight.lookAt(this.lightPosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
		mat4.multiply(this.shadowMatrix, this.cameraLight.projection, this.cameraLight.viewMatrix);
	}


	_initTextures() {
		console.log('Init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		}
		this._fboCurrent = new alfrid.FrameBuffer(numParticles*2, numParticles*2, o);
		this._fboTarget  = new alfrid.FrameBuffer(numParticles*2, numParticles*2, o);

		let shadowMapSize = 1024;
		this._fboShadowMap = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize);
	}
	

	_initViews() {
		console.log('Init Views');
		this._bAxis      = new alfrid.BatchAxis();
		this._bDotsPlane = new alfrid.BatchDotsPlane();
		this._bCopy 	 = new alfrid.BatchCopy();

		this._vRender	 = new ViewRender();
		this._vPlanes 	 = new ViewPlanes();
		this._vSim		 = new ViewSimulation();

		//	SAVE INIT POSITIONS
		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);

		this._fboCurrent.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();

		this._fboCurrent.unbind();
		GL.viewport(0, 0, GL.width, GL.height);
		GL.setMatrices(this.camera);
	}


	updateFbo() {
		GL.setMatrices(this.cameraOrtho);

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSim.render(this._fboCurrent.getTexture());
		this._fboTarget.unbind();
		GL.viewport(0, 0, GL.width, GL.height);
		GL.setMatrices(this.camera);

		//	PING PONG
		var tmp = this._fboTarget;
		this._fboTarget = this._fboCurrent;
		this._fboCurrent = tmp;
	}


	render() {
		let p = 0;

		if(this._count % params.skipCount === 0) {
			this._count = 0;
			this.updateFbo();
		}
		p = this._count / params.skipCount;
		this._count ++;

		this.orbitalControl._ry.value += -.01;

		this._flip = this._flip == 0 ? 1 : 0;
		let total = params.numSlides * params.numSlides;


		this._fboShadowMap.bind();
		GL.clear(1, 1, 1, 1);
		GL.gl.depthFunc(GL.gl.LEQUAL);
		GL.setMatrices(this.cameraLight);
		for(let i=0; i<total; i++) {
			this._vPlanes.render(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p, i, this._flip, this.shadowMatrix);
		}
		this._fboShadowMap.unbind();
		


		// this._vRender.render(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p);
		
		GL.viewport(0, 0, GL.width, GL.height);
		GL.setMatrices(this.camera);

		for(let i=0; i<total; i++) {
			this._vPlanes.render(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p, i, this._flip, this.shadowMatrix, this._fboShadowMap.getTexture(), this.lightPosition);
		}
			

		GL.setMatrices(this.cameraOrtho);
		GL.disable(GL.DEPTH_TEST);
		let viewSize = 300;
		GL.viewport(0, 0, viewSize, viewSize);
		// this._bCopy.draw(this._fboShadowMap.getTexture());
		// this._bCopy.draw(this._fboCurrent.getTexture());
		GL.enable(GL.DEPTH_TEST);
	}
}


export default SceneApp;
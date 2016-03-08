// SceneApp.js
import alfrid from './libs/alfrid.js';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSimulation from './ViewSimulation';
import ViewPlanes from './ViewPlanes';
import ViewAddVel from './ViewAddVel';
import ViewSkybox from './ViewSkybox';
import ViewThreshold from './ViewTreshold';
import ViewBlur from './ViewBlur';
import ViewBloom from './ViewBloom';

let GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		GL = alfrid.GL;
		GL.enableAlphaBlending();
		super();

		this.camera.setPerspective(Math.PI * .5, GL.aspectRatio, 1, 200);
		this.orbitalControl._rx.value = .3;
		this.orbitalControl._ry.value = 8;
		this._count = 0;
		this._flip = 0;

		let r = 18;
		this.lightPosition = [0, r, 0];
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

		function getAsset(id) {
			for(var i=0; i<assets.length; i++) {
				if(id === assets[i].id) {
					return assets[i].file;
				}
			}
		}

		let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'))
		let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'))
		let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'))
		let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'))
		let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'))
		let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'))

		this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);

		let rad_posx = alfrid.HDRLoader.parse(getAsset('rad_posx'))
		let rad_negx = alfrid.HDRLoader.parse(getAsset('rad_negx'))
		let rad_posy = alfrid.HDRLoader.parse(getAsset('rad_posy'))
		let rad_negy = alfrid.HDRLoader.parse(getAsset('rad_negy'))
		let rad_posz = alfrid.HDRLoader.parse(getAsset('rad_posz'))
		let rad_negz = alfrid.HDRLoader.parse(getAsset('rad_negz'))

		this._textureRad = new alfrid.GLCubeTexture([rad_posx, rad_negx, rad_posy, rad_negy, rad_posz, rad_negz]);


		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		}

		this._fboCurrentPos = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetPos  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboCurrentVel = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboTargetVel  = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboExtra      = new alfrid.FrameBuffer(numParticles, numParticles, o);
		this._fboRender     = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboPost0      = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboPost1      = new alfrid.FrameBuffer(GL.width, GL.height);

		let shadowMapSize = 1024;
		this._fboShadowMap = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize);
	}
	

	_initViews() {
		console.log('Init Views');
		this._bAxis      = new alfrid.BatchAxis();
		this._bDotsPlane = new alfrid.BatchDotsPlane();
		this._bCopy      = new alfrid.BatchCopy();
		
		this._vRender    = new ViewRender();
		this._vPlanes    = new ViewPlanes();
		this._vSim       = new ViewSimulation();
		this._vAddVel    = new ViewAddVel();
		this._vSkybox    = new ViewSkybox();
		this._vThreshold = new ViewThreshold();
		this._vBlur      = new ViewBlur();
		this._vBloom     = new ViewBloom();

		//	SAVE INIT POSITIONS
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

		GL.viewport(0, 0, GL.width, GL.height);
		GL.setMatrices(this.camera);
	}


	updateFbo() {
		this._fboTargetVel.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(this._fboCurrentVel.getTexture(), this._fboCurrentPos.getTexture(), this._fboExtra.getTexture());
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


		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);

		for(let i=0; i<total; i++) {
			this._vPlanes.render(this._fboTargetPos.getTexture(), this._fboCurrentPos.getTexture(), p, i, this._flip, this.shadowMatrix, this._textureRad, this._textureIrr);
		}

		this._fboRender.unbind();	


		GL.disable(GL.DEPTH_TEST);

		this._fboPost0.bind();
		GL.clear(0, 0, 0, 1);
		this._vThreshold.render(this._fboRender.getTexture());
		this._fboPost0.unbind();


		for(let i=0; i<params.numBlur; i++) {
			this._fboPost1.bind();
			GL.clear(0, 0, 0, 0);
			this._vBlur.render(this._fboPost0.getTexture(), true);
			this._fboPost1.unbind();

			this.swap();

			this._fboPost1.bind();
			GL.clear(0, 0, 0, 0);
			this._vBlur.render(this._fboPost0.getTexture(), false);
			this._fboPost1.unbind();

			this.swap();	
		}
		
		// this._bCopy.draw(this._fboPost0.getTexture());
		this._vSkybox.render(this._textureRad);
		this._vBloom.render(this._fboRender.getTexture(), this._fboPost0.getTexture());

		let size = 350;
		GL.viewport(0, 0, size, size / GL.aspectRatio);
		if(params.debug) {
			this._bCopy.draw(this._fboPost0.getTexture());	
		}
		
		GL.enable(GL.DEPTH_TEST);

	}

	swap() {
		let tmp = this._fboPost0;
		this._fboPost0 = this._fboPost1;
		this._fboPost1 = tmp;
	}

	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboPost0 = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboPost1 = new alfrid.FrameBuffer(GL.width, GL.height);
	}
}


export default SceneApp;
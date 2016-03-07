// SceneApp.js
import alfrid from './libs/alfrid.js';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSimulation from './ViewSimulation';
import ViewPlanes from './ViewPlanes';
import ViewSkybox from './ViewSkybox';


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
		this._vSkybox    = new ViewSkybox();

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

		// this.orbitalControl._ry.value += -.01;

		this._flip = this._flip == 0 ? 1 : 0;
		let total = params.numSlides * params.numSlides;

		this._vSkybox.render(this._textureIrr);
		for(let i=0; i<total; i++) {
			this._vPlanes.render(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p, i, this._flip, this.shadowMatrix, this._textureRad, this._textureIrr);
		}

		// this._vRender.render(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p);
		


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
// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewSave from './ViewSave';
import ViewSim from './ViewSim';
import ViewFishes from './ViewFishes';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		this._count = 0;
		GL.enableAlphaBlending();
		this.orbitalControl.radius.value = 20;
	}

	_initTextures() {
		let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'));
		let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'));
		let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'));
		let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'));
		let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'));
		let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'));

		this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);
		this._textureRad = alfrid.GLCubeTexture.parseDDS(getAsset('radiance'));

		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.HALF_FLOAT,
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboRender     = new alfrid.FrameBuffer(GL.width, GL.height, {}, true);
	}


	_initViews() {
		this._bCopy  = new alfrid.BatchCopy();
		this._bAxis  = new alfrid.BatchAxis();
		this._bDots  = new alfrid.BatchDotsPlane();
		this._vModel = new ViewObjModel();
		
		this._vSim   = new ViewSim();
		this._vSave  = new ViewSave();
		this._vFishes = new ViewFishes();

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
		this._count ++;
		if(this._count % params.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		let p = this._count / params.skipCount;

		GL.clear(0, 0, 0, 0);

		// this._bSkybox.draw(this._textureRad);
		// this._bAxis.draw();
		// this._bDots.draw();

		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);

		this._vFishes.render(
			this._textureRad, 
			this._textureIrr,
			this._fboTarget.getTexture(0), 
			this._fboCurrent.getTexture(0), 
			p,
			this._fboCurrent.getTexture(2)
		);

		this._fboRender.unbind();


<<<<<<< HEAD
		this._bCopy.draw(this._fboRender.getTexture(0));



		GL.disable(GL.DEPTH_TEST);
=======
		GL.disable(GL.DEPTH_TEST);
		this._bCopy.draw(this._fboRender.getTexture(0));

>>>>>>> 53e87258425dbe5a9018f61994cf4a5cc2739abb
		const size = GL.width / 3;
		GL.viewport(0, 0, size, size/GL.aspectRatio);
		this._bCopy.draw(this._fboRender.getTexture(0));

		GL.viewport(size, 0, size, size/GL.aspectRatio);
		this._bCopy.draw(this._fboRender.getTexture(1));

		GL.viewport(size*2, 0, size, size/GL.aspectRatio);
		this._bCopy.draw(this._fboRender.getTexture(2));
		GL.enable(GL.DEPTH_TEST);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
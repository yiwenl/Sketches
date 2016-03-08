// SceneApp.js
import alfrid 			from './libs/alfrid.js';
import ViewCube 		from './ViewCube';
import ViewHead 		from './ViewHead';
import ViewSkybox 		from './ViewSkybox';
import ViewSave 		from './ViewSave';
import ViewRender 		from './ViewRender';
import ViewSimulation 	from './ViewSimulation';

var glslify = require("glslify");

let GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		let fov = 60;
		this.camera.setPerspective(fov*Math.PI/180, GL.aspectRatio, 0.1, 100);

		this.cameraCubemap = new alfrid.CameraPerspective();
		this.cameraCubemap.setPerspective(fov*Math.PI/180, GL.aspectRatio, 0.1, 100);		
		let orbitalControl = new alfrid.OrbitalControl(this.cameraCubemap, window, 15);
		orbitalControl.lockZoom(true);
		orbitalControl.radius.value = .1;
		this._count = 0;
	}


	_initTextures() {
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

		this._textureAO = new alfrid.GLTexture(getAsset('aomap'));

		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		}
		this._fboCurrent = new alfrid.FrameBuffer(numParticles*2, numParticles*2, o);
		this._fboTarget  = new alfrid.FrameBuffer(numParticles*2, numParticles*2, o);
	}
	

	_initViews() {
		this._vCube      = new ViewCube();
		this._bAxis      = new alfrid.BatchAxis();
		this._bDotsPlane = new alfrid.BatchDotsPlane();
		this._bCopy      = new alfrid.BatchCopy();
		
		
		this._vHead      = new ViewHead();
		this._vSkybox    = new ViewSkybox();
		this._vSim		 = new ViewSimulation();
		this._vRender	 = new ViewRender();

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
		// this.orbitalControl._ry.value += .01;
		let p = 0;

		if(this._count % params.skipCount === 0) {
			this._count = 0;
			this.updateFbo();
		}
		p = this._count / params.skipCount;
		this._count ++;

		params.roughness = params.offset;
		params.metallic = 1.0 - params.roughness;
		params.specular = (1.0 - params.roughness) * .9 + .1;
		if(!this._vHead.isReady) {
			return;
		}

		if(document.body.classList.contains('isLoading')) {
			document.body.classList.remove('isLoading');
		}
		

		GL.setMatrices(this.cameraCubemap);
		this._vSkybox.render(this._textureRad);


		GL.setMatrices(this.camera);
		this._vHead.render(this._textureRad, this._textureIrr, this._textureAO, this._fboTarget.getTexture());

		this._vRender.render(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p);

	}
}


export default SceneApp;
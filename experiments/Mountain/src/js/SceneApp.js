// SceneApp.js
import alfrid 			from './libs/alfrid.js';
// import ViewHead 		from './ViewHead';
import ViewMountain 	from './ViewMountain';
import ViewSkybox 		from './ViewSkybox';
import ViewThreshold 	from './ViewTreshold';
import ViewBlur 		from './ViewBlur';
import ViewBloom 		from './ViewBloom';

var glslify = require("glslify");

let GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		// GL.enable(GL.SCISSOR_TEST);
		let fov = 60;
		this.camera.setPerspective(fov*Math.PI/180, GL.aspectRatio, 0.1, 100);

		this.cameraCubemap = new alfrid.CameraPerspective();
		this.cameraCubemap.setPerspective(fov*Math.PI/180, GL.aspectRatio, 0.1, 100);		
		let orbitalControl = new alfrid.OrbitalControl(this.cameraCubemap, window, 15);
		orbitalControl.lockZoom(true);
		orbitalControl.radius.value = .1;
		this.orbitalControlCube = orbitalControl;
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

		this._textureInk = new alfrid.GLTexture(getAsset('inkMap'));
		this._textureDetail = new alfrid.GLTexture(getAsset('detailHeight'));
		this._textureNoise = new alfrid.GLTexture(getAsset('noise'));


		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboPost0 = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboPost1 = new alfrid.FrameBuffer(GL.width, GL.height);
	}
	

	_initViews() {
		this._bCopy      = new alfrid.BatchCopy();
		// this._vHead      = new ViewHead();
		this._vSkybox    = new ViewSkybox();
		this._vThreshold = new ViewThreshold();
		this._vBlur 	 = new ViewBlur();
		this._vBloom 	 = new ViewBloom();
		this._vMountain  = new ViewMountain();
	}


	render() {
		params.roughness = params.offset;
		params.metallic = 1.0 - params.roughness;
		params.specular = (1.0 - params.roughness) * .9 + .1;

		if(document.body.classList.contains('isLoading')) {
			document.body.classList.remove('isLoading');
		}


		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);

		
		GL.setMatrices(this.camera);
		// this._vHead.render(this._textureRad, this._textureIrr, this._textureInk);
		this._vMountain.render(this._textureRad, this._textureIrr, this._textureInk, this._textureDetail, this._textureNoise);
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
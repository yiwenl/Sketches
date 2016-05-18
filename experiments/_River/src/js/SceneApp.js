// SceneApp.js

import alfrid , { Scene } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewBox from './ViewBox';
import ViewMap from './ViewMap';
import ViewReflection from './ViewReflection';

const GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = Math.PI/6;
		this.orbitalControl.radius.value = 20;
	}

	_initTextures() {
		console.log('init textures');
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

		this._textureMap = new alfrid.GLTexture(getAsset('colorMap'));
		this._textureHeight = new alfrid.GLTexture(getAsset('heightBlur'));

		let canvas = document.createElement("canvas");
		canvas.width = canvas.height = 4;
		let ctx = canvas.getContext('2d');
		ctx.fillStyle = '#FFF';
		ctx.fillRect(0, 0, 4, 4);
		this._textureWhite = new alfrid.GLTexture(canvas);

		this._fboReflection = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();

		this._vBox = new ViewBox();
		this._vMap = new ViewMap();
		this._vReflection = new ViewReflection();
	}


	render() {
		GL.clear(0, 0, 0, 0);
		// this._bSkybox.draw(this._textureRad);
		// this._bAxis.draw();
		// this._bDots.draw();

		// this._vModel.render(this._textureRad, this._textureIrr, this._textureAO);
		


		this._fboReflection.bind();
		GL.clear(0, 0, 0, 0);
		GL.gl.cullFace(GL.gl.FRONT);
		this._vBox.render(this._textureRad, this._textureIrr, this._textureWhite, true);
		GL.gl.cullFace(GL.gl.BACK);
		this._fboReflection.unbind();
		// this._vMap.render(this._textureMap, this._textureHeight, this._textureRad, this._textureIrr, this._textureWhite);

		// const size = 200;
		// GL.viewport(0, 0, size, size/GL.aspectRatio);
		// GL.disable(GL.DEPTH_TEST);
		// this._bCopy.draw(this._fboReflection.getTexture());
		// GL.enable(GL.DEPTH_TEST);
		this._vBox.render(this._textureRad, this._textureIrr, this._textureWhite);
		this._vReflection.render(this._fboReflection.getTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
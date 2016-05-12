// SceneApp.js

import alfrid , { Scene } from 'alfrid';
import ViewTerrain from './ViewTerrain';
import ViewTree from './ViewTree';
import ViewDome from './ViewDome';

const GL = alfrid.GL;
const RAD = Math.PI/180;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.camera.setPerspective(70 * RAD, GL.aspectRatio, .1, 10);
		let v = vec3.fromValues(-3, .37, -2);
		this.orbitalControl.radius.setTo(2);
		this.orbitalControl.radius.value = 0.452;

		// this.orbitalControl.center[1] = 0.65;
		// this.orbitalControl.positionOffset[1] = 0.25;
		// this.orbitalControl.rx.value = .1;
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

		this._textureAOTerrain = new alfrid.GLTexture(getAsset('aoTerrain'));
		this._textureAOTree = new alfrid.GLTexture(getAsset('aoTree'));
		this._textureBg1 = new alfrid.GLTexture(getAsset('bg1'));
		this._textureBg2 = new alfrid.GLTexture(getAsset('bg2'));
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();

		this._vTerrain = new ViewTerrain();
		this._vTree = new ViewTree();
		this._vDome = new ViewDome();
	}


	render() {
		GL.clear(0, 0, 0, 0);
		this._bSkybox.draw(this._textureRad);
		this._bAxis.draw();
		this._bDots.draw();

		this._vDome.render(this._textureBg1, this._textureBg2);
		// this._vTerrain.render(this._textureRad, this._textureIrr, this._textureAOTerrain);
		// this._vTree.render(this._textureRad, this._textureIrr, this._textureAOTree);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
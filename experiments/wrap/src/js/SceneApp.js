// SceneApp.js

import alfrid , { Scene } from 'alfrid';
import ViewObjModel from './ViewObjModel';

const GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.radius.value = 20;
		this.orbitalControl.rx.value = .3;
		this.orbitalControl.ry.value = .3;
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

		this._textureAO = new alfrid.GLTexture(getAsset('aomap'));
		this._textureNormal = new alfrid.GLTexture(getAsset('normalmap'));
		this._textureColor = new alfrid.GLTexture(getAsset('colormap'));

		window.addEventListener('keydown', (e)=>this._onKey(e) );
		window.addEventListener('mousedown', ()=>{
			this.orbitalControl.rx.easing = .1;
			this.orbitalControl.ry.easing = .1;
		} );
		gui.add(this, 'toggle');
	}	


	_onKey(e) {
		if(e.keyCode === 32) {
			this.toggle();			
		}
	}

	toggle() {
		this.orbitalControl.rx.easing = .01;
		this.orbitalControl.ry.easing = .01;

		const dir = Math.random() > .5 ? Math.PI : -Math.PI;
		this.orbitalControl.ry.value += dir; 
		this.orbitalControl.rx.value *= -1; 


		let pos = vec3.clone(this.camera.position);

		vec3.normalize(pos, pos);
		vec3.scale(pos, pos, -5);

		this._vModel.toggle(pos);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();
		this._vModel = new ViewObjModel();
	}


	render() {
		GL.clear(0, 0, 0, 0);
		// this._bSkybox.draw(this._textureRad);
		// this._bAxis.draw();
		// this._bDots.draw();

		this._vModel.render(this._textureRad, this._textureIrr, this._textureColor, this._textureAO);

/*
		const s = .2;
		this._bBall.draw([0, 5, 0], [s, s, s], [1, 0, 0]);
		this._bBall.draw([0, -5, 0], [s, s, s], [1, 0, 0]);

		this._bBall.draw([5, 0, 0], [s, s, s], [1, 1, 0]);
		this._bBall.draw([-5, 0, 0], [s, s, s], [1, 1, 0]);

		this._bBall.draw([0, 0, 5], [s, s, s], [0, 0, 1]);
		this._bBall.draw([0, 0, -5], [s, s, s], [0, 0, 1]);

*/		
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
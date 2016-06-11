// SceneApp.js

import alfrid, { Scene } from 'alfrid';
import ViewDots from './ViewDots';
import ViewNormal from './ViewNormal';

const GL = alfrid.GL;
const num = 5 * 1;

console.log( num * 256 * 256);

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.2;
		this.time = 0;
	}

	_initTextures() {
		console.log('init textures');
		this._textureMap      = new alfrid.GLTexture(getAsset('map'));
		this._textureLightMap = new alfrid.GLTexture(getAsset('lightmap'));
		const fboSize         = 1024;
		this._fboNormal       = new alfrid.FrameBuffer(fboSize, fboSize*2);
	}


	_initViews() {
		this._bCopy   = new alfrid.BatchCopy();
		this._bAxis   = new alfrid.BatchAxis();
		this._bDots   = new alfrid.BatchDotsPlane();
		this._bBall   = new alfrid.BatchBall();
		this._vDots   = new ViewDots();
		this._vNormal = new ViewNormal();

		this._fboNormal.bind();
		GL.clear(0, 0, 0, 0);
		this._vNormal.render(this._textureMap);
		this._fboNormal.unbind();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this.time += 0.001;
		const r = 5;
		const x = Math.cos(this.time) * r;
		const z = Math.sin(this.time) * r;
		this.orbitalControl.center[0] = x;
		this.orbitalControl.center[2] = z;
		this.orbitalControl.positionOffset[0] = x;
		this.orbitalControl.positionOffset[2] = z;

		
		for(let j=0; j<num; j++) {
			for(let i=0; i<num; i++) {
				this._vDots.render(this._textureMap, [i/num, j/num], num, this._fboNormal.getTexture());
			}
		}


		/*
		const size = 150;
		GL.viewport(0, 0, size, size*2);
		this._bCopy.draw(this._textureMap);

		GL.viewport(size, 0, size, size*2);
		this._bCopy.draw(this._fboNormal.getTexture());
		*/
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
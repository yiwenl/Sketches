// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewSky from './ViewSky';
import Assets from './Assets';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;

		this._offset = new alfrid.TweenNumber(1, 'linear');
		window.addEventListener('keydown', (e) => {
			// console.log(e.keyCode );
			if(e.keyCode === 32) {
				this.next();
			}
		})
	}

	_initTextures() {
		console.log('init textures');
		this._indexTime = 2;
		this._getTexture();

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		// this._bAxis = new alfrid.BatchAxis();
		// this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox();

		this._vModel = new ViewObjModel();
		this._vSky = new ViewSky();
	}


	next() {
		this._indexTime++;
		if(this._indexTime == times.length) {
			this._indexTime = 0;
		}

		this._getTexture();

		this._offset.setTo(0);
		this._offset.value = 1;
	}	

	_getTexture() {
		const curr = times[this._indexTime];
		const indexNext = this._indexTime === times.length -1 ? 0 : this._indexTime + 1;
		const next = times[indexNext];

		this._texRadCurr = Assets.get(`${curr}_radiance`);
		this._texIrrCurr = Assets.get(`irr${curr}`);

		this._texRadNext = Assets.get(`${next}_radiance`);
		this._texIrrNext = Assets.get(`irr${next}`);
	}


	render() {
		this.orbitalControl.ry.value += 0.01;
		GL.clear(0, 0, 0, 0);

		// this._vSky.render(this._texIrrCurr, this._texIrrNext, this._offset.value);
		// this._vSky.render(this._texRadCurr, this._texRadNext, this._offset.value);

		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		this._vModel.render(this._texRadCurr, this._texIrrCurr, this._texRadNext, this._texIrrNext, Assets.get('aomap'), this._offset.value);
		this._fboRender.unbind();

		const size = window.innerWidth/2;
		GL.viewport(0, 0, size, size/GL.aspectRatio);
		this._bCopy.draw(this._fboRender.getTexture());
		GL.viewport(size, 0, size, size/GL.aspectRatio);
		this._bCopy.draw(this._fboRender.getDepthTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
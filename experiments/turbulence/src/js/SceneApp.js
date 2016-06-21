// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewLines from './ViewLines';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 10;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		};

		this._fbos = [];
		for(let i=0; i<params.numFbos; i++) {
			const fbo = new alfrid.FrameBuffer(numParticles, numParticles, o, true);
			this._fbos.push(fbo);
		}
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();


		//	views
		this._vRender = new ViewRender();
		this._vSim    = new ViewSim();
		this._vLines  = new ViewLines();

		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);

		const fbo = this._fbos[this._fbos.length-1];
		fbo.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();
		fbo.unbind();		

		GL.setMatrices(this.camera);
	}


	updateFbo() {
		const fboTarget = this._fbos.shift();
		const fboCurrent = this._fbos[this._fbos.length-1];

		fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSim.render(fboCurrent.getTexture(1), fboCurrent.getTexture(0), fboCurrent.getTexture(2));
		fboTarget.unbind();

		this._fbos.push(fboTarget);
	}


	render() {
		this.updateFbo();

		GL.clear(0, 0, 0, 0);
		this._bAxis.draw();
		this._bDots.draw();

		const fboTarget = this._fbos[this._fbos.length-1];

		// this._vRender.render(fboTarget.getTexture(0), fboTarget.getTexture(2));
		this._vLines.render(this._fbos);

		const size = Math.min(params.numParticles, GL.height/4);

		for(let i=0; i<4; i++) {
			GL.viewport(0, size * i, size, size);
			this._bCopy.draw(this._fbos[0].getTexture(i));
		}

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
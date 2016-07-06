// SceneApp.js

import alfrid, { Scene, Ray, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSim from './ViewSim';
import ViewGrass from './ViewGrass';
import ViewHitPlane from './ViewHitPlane';
import ViewNoise from './ViewNoise';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._ray = new Ray([0, 0, 0], [0, 0, -1]);

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 20;
		this.orbitalControl.rx.value = 0.8;
		this.orbitalControl.positionOffset[1] = 2;

		this.hit = [999, 999, 999];

		window.addEventListener('mousemove', (e)=>this._onMove(e));
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, true);

		const noiseSize 	= 128;
		this._fboNoise 		= new alfrid.FrameBuffer(noiseSize, noiseSize);
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bBall = new alfrid.BatchBall();


		//	views
		this._vRender   = new ViewRender();
		this._vSim      = new ViewSim();
		this._vGrass    = new ViewGrass();
		this._vHitPlane = new ViewHitPlane();
		this._vNoise    = new ViewNoise();

		this._vSave = new ViewSave();
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

	_onMove(e) {
		let mx, my;
		if(e.touches) {
			mx = (e.touches[0].pageX / GL.width) * 2.0 - 1.0;
			my = - (e.touches[0].pageY / GL.height) * 2.0 + 1.0;
		} else {
			mx = (e.clientX / GL.width) * 2.0 - 1.0;
			my = - (e.clientY / GL.height) * 2.0 + 1.0;	
		}
		
		this.camera.generateRay([mx, my, 0], this._ray);
		const mesh = this._vHitPlane.mesh;
		const faceVertices = mesh.faces.map((face)=>(face.vertices));
		const offset = 1;
		let v0, v1, v2;
		let hit = [999, 999, 999];

		for(let i = 0; i < faceVertices.length; i++) {
			const vertices = faceVertices[i];
			v0 = [vertices[0][0], vertices[0][1]+offset, vertices[0][2]];
			v1 = [vertices[1][0], vertices[1][1]+offset, vertices[1][2]];
			v2 = [vertices[2][0], vertices[2][1]+offset, vertices[2][2]];

			hit = this._ray.intersectTriangle(v0, v1, v2);
			if(hit) {	break;	}
		}

		this.hit = hit || [999, 999, 999];
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
			// this._count = 0;
			// this.updateFbo();
		}

		let p = this._count / params.skipCount;

		GL.clear(0, 0, 0, 0);

		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render();
		this._fboNoise.unbind();

		// this._vRender.render(this._fboTarget.getTexture(0), this._fboCurrent.getTexture(0), p, this._fboCurrent.getTexture(2));
		this._vGrass.render(this._fboNoise.getTexture(), this.hit);
		this._vHitPlane.render();
		const s = 3;
		this._bBall.draw(this.hit, [s, s, s], [.7, 0, 0], 0.5);

		const size = 200;

		for(let i=0; i<4; i++) {
			GL.viewport(0, size * (i+1), size, size);
			// this._bCopy.draw(this._fboCurrent.getTexture(i));
		}

		GL.viewport(0, 0, size, size);
		// this._bCopy.draw(this._fboNoise.getTexture());

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
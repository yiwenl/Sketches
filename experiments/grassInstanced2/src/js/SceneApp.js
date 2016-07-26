// SceneApp.js

import alfrid, { Scene, GL, Ray } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewGrass from './ViewGrass';
import ViewHit from './ViewHit';
import ViewSky from './ViewSky';
import ViewNoise from './ViewNoise';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this.camera.setPerspective(90 * Math.PI / 180, GL.aspectRatio, 0.1, 100);
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.rx.limit(.2, .5);
		this.orbitalControl.center[1] = 1;

		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this.hit = [999, 999, 999];
		GL.canvas.addEventListener('mousemove', (e)=>this._onMove(e));
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
		const mesh = this._vHit.mesh;
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

	_initTextures() {
		this._textureGrass = new alfrid.GLTexture(getAsset('grass'));

		const noiseSize  	= 64;
		this._fboNoise  	= new alfrid.FrameBuffer(noiseSize, noiseSize, {type:GL.UNSIGNED_BYTE});
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();
		// this._vModel = new ViewObjModel();

		this._vGrass = new ViewGrass();
		this._vHit   = new ViewHit();
		this._vSky   = new ViewSky();
		this._vNoise = new ViewNoise();
	}


	render() {
		GL.clear(0, 0, 0, 0);
		// this._bSkybox.draw(this._textureRad);
		// this._bAxis.draw();
		// this._bDots.draw();

		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render();
		this._fboNoise.unbind();

		this._vSky.render();
		GL.disable(GL.CULL_FACE);
		this._vGrass.render(this.hit, this._textureGrass, this._fboNoise.getTexture());
		GL.enable(GL.CULL_FACE);

		this._vHit.render();

		let size = 3;
		this._bBall.draw(this.hit, [size, size, size], [1, 1, 1], .05);
/*
		size = GL.height/4;

		for(let i=0; i<4; i++) {
			GL.viewport(0, size * i, size, size);
			this._bCopy.draw(this._fboNoise.getTexture(i));
		}
*/		
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
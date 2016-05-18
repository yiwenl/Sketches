// SceneApp.js

import alfrid , { GL, Scene } from 'alfrid';
import ViewReflection from './ViewReflection';
import ViewNoise from './ViewNoise';
import ViewNormal from './ViewNormal';
import ViewMountain from './ViewMountain';
import ViewSky from './ViewSky';
import ViewMap from './ViewMap';
import ViewBoat from './ViewBoat';

var random = function(min, max) { return min + Math.random() * (max - min);	}
window.getAsset = function(id) {
	for(var i=0; i<assets.length; i++) {
		if(id === assets[i].id) {
			return assets[i].file;
		}
	}
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this.orbitalControl.rx.value = .1;
		this.orbitalControl.radius.value = 10;
		//	limit camera angle
		this.orbitalControl.rx.limit(0, Math.PI/3);
	}

	_initTextures() {
		console.log('init textures');

		//	fullsize reflection fbo ? 
		this._fboReflection = new alfrid.FrameBuffer(1024, 1024);
		this._textureNormal = new alfrid.GLTexture(getAsset('normal'));
		this._textureNoise = new alfrid.GLTexture(getAsset('noise'));
		this._textureBg = new alfrid.GLTexture(getAsset('bg'));

		let canvas = document.createElement("canvas");
		canvas.width = canvas.height = 4;
		let ctx = canvas.getContext('2d');
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, 4, 4);
		this._textureWhite = new alfrid.GLTexture(canvas);
		this._textureBoat = new alfrid.GLTexture(getAsset('aoBoat'));

		const NOISE_SIZE = 512;
		this._fboNoise = new alfrid.FrameBuffer(NOISE_SIZE, NOISE_SIZE);
		this._fboNormal = new alfrid.FrameBuffer(NOISE_SIZE, NOISE_SIZE);
	}


	_initViews() {
		console.log('init views');
		
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vReflection = new ViewReflection();
		this._vNoise = new ViewNoise();
		this._vNormal = new ViewNormal();
		this._vSky = new ViewSky();
		this._vMap = new ViewMap();
		this._vBoat = new ViewBoat();

		this._textureMountains = [];
		this._mountains = [];

		const NUM_MOUNTAINS = 40;
		const RANGE = 4;
		const RANGE_Z = 10;
		const RIVER_WIDTH = 1.5;
		for(let i=0; i<NUM_MOUNTAINS; i++) {
			let v = new ViewMountain();
			let x = random(RIVER_WIDTH, RANGE);
			if(Math.random() > .5) x *= -1;
			v.x = x;
			v.z = random(-RANGE_Z, RANGE_Z);
			this._mountains.push(v);
			if(!this._textureMountains[v.textureIndex]) {
				this._textureMountains[v.textureIndex] = new alfrid.GLTexture(getAsset('inkDrops'+v.textureIndex));
			}
		}
	}


	render() {
		//	update mountain positioin ( keep moving forward )
		

		//	update boat direction ( based on keyboard control )
		// this._vBoat.rotation = -this.orbitalControl.ry.value;
		
		GL.clear(0, 0, 0, 0);

		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render(this._textureNoise);
		this._fboNoise.unbind();

		this._fboNormal.bind();
		GL.clear(0, 0, 0, 0);
		this._vNormal.render(this._fboNoise.getTexture());
		this._fboNormal.unbind();

		this._vMap.render();

		

		this._fboReflection.bind();
		GL.clear(0, 0, 0, 0);
		GL.gl.cullFace(GL.gl.FRONT);

		//	render skybox ( reflection map )
		this._vSky.render(this._textureBg, true);

		//	render mountains
		const shader = this._mountains[0].shader;
		for(let i=0; i<this._mountains.length; i++) {
			let m = this._mountains[i];
			// m.render(this._textureMountains, true, shader, i == 0);
		}

		//	render boat

		this._vBoat.render(this._textureBoat, true);

		GL.gl.cullFace(GL.gl.BACK);
		this._fboReflection.unbind();


		
/*
		GL.disable(GL.DEPTH_TEST);
		this._vReflection.render(this._fboReflection.getTexture(), this._fboNormal.getTexture());
		GL.enable(GL.DEPTH_TEST);
	

		// this._vSky.render(this._textureBg);
		for(let i=0; i<this._mountains.length; i++) {
			let m = this._mountains[i];
			m.render(this._textureMountains, false, shader, i == 0);
		}

		*/

		// this._vBoat.render(this._textureBoat, false);

		
		if(params.debugNoise) {
			const size = 200;
			GL.viewport(0, 0, size, size);
			this._bCopy.draw(this._fboNoise.getTexture());
			GL.viewport(size, 0, size, size);
			this._bCopy.draw(this._fboNormal.getTexture());	
		}
	}


	renderReflection() {

	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
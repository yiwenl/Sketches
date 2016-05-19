// SceneApp.js

import alfrid , { GL, Scene } from 'alfrid';
import ViewReflection from './ViewReflection';
import ViewNoise from './ViewNoise';
import ViewNormal from './ViewNormal';
import ViewMountain from './ViewMountain';
import ViewSky from './ViewSky';
import ViewBoat from './ViewBoat';
// import ViewGiant from './ViewGiant';

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

		const RAD = Math.PI / 180;
		this.camera.setPerspective(75 * RAD, GL.aspectRatio, .1, 100);

		this.orbitalControl.rx.value = 0.05;
		this.orbitalControl.radius.setTo(6);
		this.orbitalControl.radius.value = 7;
		this.orbitalControl.center[1] = 1;
		this.orbitalControl.lockZoom(true);
		//	limit camera angle
		this.orbitalControl.rx.limit(0.05, Math.PI * 0.1);
		const range = 0.34;
		this.orbitalControl.ry.limit(-range, range);
	}

	_initTextures() {
		console.log('init textures');

		//	fullsize reflection fbo ? 
		const REFLECTOIN_SIZE = 512*2;
		this._fboReflection = new alfrid.FrameBuffer(REFLECTOIN_SIZE, REFLECTOIN_SIZE);
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
		this._textureGiant = new alfrid.GLTexture(getAsset('aoGiant'));

		const NOISE_SIZE = 512/2;
		this._fboNoise = new alfrid.FrameBuffer(NOISE_SIZE, NOISE_SIZE);
		this._fboNormal = new alfrid.FrameBuffer(NOISE_SIZE, NOISE_SIZE);
	}


	_initViews() {
		console.log('init views');
		this._bCopy = new alfrid.BatchCopy();

		this._vReflection = new ViewReflection();
		this._vNoise = new ViewNoise();
		this._vNormal = new ViewNormal();
		this._vSky = new ViewSky();
		this._vBoat = new ViewBoat();
		// this._vGiant = new ViewGiant();

		this._textureMountains = [];
		this._mountains = [];

		const NUM_MOUNTAINS = 100;
		const RANGE = 7;
		const RANGE_Z = params.maxRange;
		const RIVER_WIDTH = 2.3;
		for(let i=0; i<NUM_MOUNTAINS; i++) {
			let v = new ViewMountain();
			let x = random(RIVER_WIDTH, RANGE);
			let z = random(-RANGE_Z, RANGE_Z); 
			if(Math.random() > .5) x *= -1;
			v.setPosition(x, z);
			this._mountains.push(v);

			if(!this._textureMountains[v.textureIndex]) {
				this._textureMountains[v.textureIndex] = new alfrid.GLTexture(getAsset('inkDrops'+v.textureIndex));
			}
		}
	}


	render() {
		params.globalTime += 0.001;
		params.zOffset.value += .1;
		if(params.zOffset.value > params.maxRange * 2.0) {
			params.zOffset.setTo(params.zOffset.value - params.maxRange * 2.0);
		}
		
		GL.clear(0, 0, 0, 0);

		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render(this._textureNoise);
		this._fboNoise.unbind();

		this._fboNormal.bind();
		GL.clear(0, 0, 0, 0);
		this._vNormal.render(this._fboNoise.getTexture());
		this._fboNormal.unbind();

		// this._vMap.render();

		
		//	render reflection
		this._fboReflection.bind();
		GL.clear(0, 0, 0, 0);
		GL.gl.cullFace(GL.gl.FRONT);

		//	render skybox ( reflection map )
		this._vSky.render(this._textureBg, true);

		//	render mountains
		const shader = this._mountains[0].shader;
		this._mountains.map( (m, i) => {

			//	update mountain position
			let offset = params.zOffset.value;
			let offsetX = Math.cos(m.position[2]/params.maxRange * Math.PI/2) * 5.0 - 4.5;
			m.position[0] = m.orgPosition[0] + offsetX;
			m.position[2] = m.orgPosition[2] + offset;
			if(m.position[2] > params.maxRange) {
				m.position[2] -= params.maxRange * 2;
			} else if(m.position[2] < -params.maxRange) {
				m.position[2] += params.maxRange * 2;
			}

			m.render(this._textureMountains, this._textureBg, true, shader, i == 0);
		});

		//	render boat
		this._vBoat.render(this._textureBoat, true);

		GL.gl.cullFace(GL.gl.BACK);
		this._fboReflection.unbind();

		//	render for real
//*/
		GL.disable(GL.DEPTH_TEST);
		this._vReflection.render(this._fboReflection.getTexture(), this._fboNormal.getTexture());
		GL.enable(GL.DEPTH_TEST);
		

		this._vSky.render(this._textureBg, false);
		this._mountains.map( (m, i) => {
			m.render(this._textureMountains, this._textureBg, false, shader, i == 0);
		});

		//*/

		this._vBoat.render(this._textureBoat, false);
		// this._vGiant.render(this._textureGiant, false);

		
		if(params.debugNoise) {
			const size = 200;
			GL.viewport(0, 0, size, size);
			this._bCopy.draw(this._fboNoise.getTexture());
			GL.viewport(size, 0, size, size);
			this._bCopy.draw(this._fboNormal.getTexture());	
		}
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
// SceneApp.js

import alfrid, { GL, Scene } from 'alfrid';
import ViewMountain from './ViewMountain';
import ViewCut from './ViewCut';
import ViewGodRay from './ViewGodRay';
import EffectComposer from './effectComposer/EffectComposer';
import PassBlur from './effectComposer/passes/PassBlur';
import Pass from './effectComposer/Pass';

window.getAsset = function(id) {
	return assets.find( (a) => { return a.id === id; }).file;
}
const random = function(min, max) { return min + Math.random() * (max - min);	}
const fsCut = require('../shaders/cut.frag');


const NUM_MOUNTAINS = 50;

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		const RAD = Math.PI / 180;
		this.camera.setPerspective(75 * RAD, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.setTo(6);
		this.orbitalControl.radius.value = 7;
	}

	_initTextures() {
		console.log('init textures');

		console.log('Assets : ', getAsset('inkDrops2'));

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vCut = new ViewCut();
		this._vGodRay = new ViewGodRay();

		const lightMapSize = 512;
		this._composerBlur = new EffectComposer(lightMapSize, lightMapSize);
		const passBlur = new PassBlur();
		const passCut = new Pass(fsCut);
		// this._composerBlur.addPass(passBlur);
		// this._composerBlur.addPass(passBlur);
		this._composerBlur.addPass(passCut);


		this._textureMountains = [];
		this._mountains = [];
		const RANGE = 20;

		for(let i=0; i<NUM_MOUNTAINS; i++) {
			let v = new ViewMountain();
			let x = random(-RANGE, RANGE);
			let z = random(-RANGE, RANGE); 
			v.setPosition(x, z);
			this._mountains.push(v);

			if(!this._textureMountains[v.textureIndex]) {
				this._textureMountains[v.textureIndex] = new alfrid.GLTexture(getAsset('inkDrops'+v.textureIndex));
			}
		}
	}


	render() {
		this.orbitalControl.ry.value += 0.01;
		GL.clear(0, 0, 0, 0);

		this._fboRender.bind();
		GL.clear(0, 0, 0, 0);
		const shader = this._mountains[0].shader;
		this._mountains.map( (m, i) => {
			m.render(this._textureMountains, alfrid.GLTexture.whiteTexture(), false, shader, i == 0);
		});
		this._fboRender.unbind();

		// this._bCopy.draw(this._fboRender.getTexture());

		this._composerBlur.render(this._fboRender.getTexture());
		// this._vCut.render(this._composerBlur.getTexture());

		// GL.enableAdditiveBlending();
		GL.disable(GL.DEPTH_TEST);
		
		this._vGodRay.render(this._composerBlur.getTexture());
		this._bCopy.draw(this._fboRender.getTexture());
		// this._bCopy.draw(this._composerBlur.getTexture());
		GL.enableAlphaBlending();
		GL.enable(GL.DEPTH_TEST);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
import FboPingPong from './FboPingPong';
import FluidSimulation from './FluidSimulation';
import ViewPlane from './ViewPlane';
import ViewLines from './ViewLines';
import Assets from './Assets';
import getMesh from './utils/getMesh';
import Capture from './utils/Capture';
import { resize, biasMatrix } from './utils';
import Config from './Config';
import PassNormal from './passes/PassNormal';
import PassBloom from './PassBloom';
import ViewParticles from './ViewParticles';

class SceneApp extends Scene {
	constructor() {
		super();
		this.camera.setPerspective(Math.PI/4, GL.aspectRatio, 1, 50);
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		// this.orbitalControl.rx.value  = 0.8;
		// this.orbitalControl.ry.value = Math.PI;
		this.orbitalControl.radius.value = 10;
		this.orbitalControl.radius.limit(5, 15);
		this.orbitalControl.rx.limit(0.1, Math.PI / 2-0.1);

		this.lightPos = [5, 0.75, 2.0];
		this._cameraLight = new alfrid.CameraOrtho();
		const s = 6.75;
		this._cameraLight.ortho(-s, s, s, -s, 1, 50);
		this._cameraLight.lookAt(this.lightPos, [0, 0, 0]);

		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, biasMatrix, this._shadowMatrix);

		// this.resize(1080, 1350);
		this.resize();

		// gui.add(params, 'height', 1, 5);
		// gui.add(params, 'cap', 0, 5);
	}

	_initTextures() {
		const s = 1024;
		window.GL = GL

		this._fboNormal = new alfrid.FrameBuffer(s, s, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});


		const oRender = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
			type:GL.FLOAT
		};

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
		this._fboShadow = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
	}


	_initViews() {

		this._bCopy  = new alfrid.BatchCopy();
		this._fluid  = new FluidSimulation(this.camera);

		// this._bSky = new alfrid.BatchSkybox();
		// this._bBall = new alfrid.BatchBall();

		this._vPlane = new ViewPlane();
		this._passNormal = new PassNormal();
		this._vLines = new ViewLines();
		this._passBloom = new PassBloom(3);

		this._vParticles = new ViewParticles();
	}

	_renderShadowMap() {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight);
		this._vParticles.renderShadow(this._fluid.density, this.lightPos);
		this._fboShadow.unbind();
	}


	render() {

		//	update fluid
		this._fluid.update();

		//	update normal 
		this._fboNormal.bind();
		GL.clear(0, 0, 0, 0);
		this._passNormal.render(this._fluid.density);
		this._fboNormal.unbind();

		this._renderShadowMap();
		GL.setMatrices(this.camera);
		//	first render
		this._fboRender.bind();
		let g = 0.05;
		GL.clear(g, g, g, 1);

		this._vParticles.render(
			this._fluid.density, 
			this.lightPos,
			this._shadowMatrix, 
			this._fboShadow.getDepthTexture()
		);

		GL.enableAdditiveBlending();
		GL.disable(GL.DEPTH_TEST);
		this._vPlane.render(this._fluid.density, this._fboNormal.getTexture(), Assets.get('studio_radiance'), Assets.get('irr'));

		GL.enableAlphaBlending();
		

		this._fboRender.unbind();

		this._passBloom.render(this._fboRender.getTexture());


		//	output
		GL.clear(0, 0, 0, 0);
		GL.disable(GL.DEPTH_TEST);
		GL.viewport(0, 0, GL.width, GL.height);
		GL.enableAdditiveBlending();
		this._bCopy.draw(this._fboRender.getTexture());
		this._bCopy.draw(this._passBloom.getTexture());

		GL.enableAlphaBlending();
		


		let s = Math.min(256, GL.width/4);
		s = 400;
		GL.viewport(0, 0, s, s);
		// this._bCopy.draw(this._fboShadow.getTexture());
		this._fluid.allTextures.forEach( (t, i) => {
			GL.viewport(i * s, 0, s, s);
			// this._bCopy.draw(t);
		});

		GL.enable(GL.DEPTH_TEST);
	}


	resize(w, h) {
		resize(w, h);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
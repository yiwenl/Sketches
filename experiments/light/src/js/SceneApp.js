// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';

import Fbo from './Fbo';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewRenderShadow from './ViewRenderShadow';
import ViewSim from './ViewSim';
import ViewBelt from './ViewBelt';
import ViewFxaa from './ViewFxaa';
import ViewBg from './ViewBg';
import PassBloom from './PassBloom';

import fs from 'shaders/normal.frag';

class SceneApp extends Scene {
	constructor() {

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 15;
		this.orbitalControl.radius.limit(8, 20);

		let r = 1;
		// this.orbitalControl.rx.limit(-r, r);
		// this.orbitalControl.ry.limit(-r, r);


		//	shadow
		this.cameraLight = new alfrid.CameraOrtho();
		let s = 10;
		this.cameraLight.ortho(-s, s, -s, s, 1, 50);
		this.cameraLight.lookAt([0, 10, 0], [0, 0, 0], [0, 0, -1]);

		const biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this.shadowMatrix = mat4.create();
		mat4.multiply(this.shadowMatrix, this.cameraLight.projection, this.cameraLight.viewMatrix);
		mat4.multiply(this.shadowMatrix, biasMatrix, this.shadowMatrix);

		this.count = 0;
	}


	_initTextures() {
		console.log('init textures');

		const { numParticles } = Config;

		//	init textures
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};
		this.fbo = new Fbo(numParticles, numParticles, o, 3);
		this.fboShadow = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
		let s = 32 * 2;
		this.fboParticle = new alfrid.FrameBuffer(s, s, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
		this.fboRender = new alfrid.FrameBuffer(GL.width, GL.height, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});


		const size = 1;
		this.cameraOrtho.ortho(-size, size, -size, size);
		
		this.meshSphere = alfrid.Geom.sphere(1, 12);
		this.shaderSphere = new alfrid.GLShader(null, fs);
		this._updateParticleTexture();
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();

		this.vRender       = new ViewRender();
		this.vRenderShadow = new ViewRenderShadow();
		this.vSim          = new ViewSim();
		this.vBelt 		= new ViewBelt();
		this.vFxaa 		= new ViewFxaa;
		this.vBg 			= new ViewBg();
		this.passBloom 	= new PassBloom(5, .5);

		const vSave = new ViewSave();
		this.fbo.read.bind();
		GL.clear(0, 0, 0, 0);
		vSave.render();
		this.fbo.read.unbind();

		this.fbo.write.bind();
		GL.clear(0, 0, 0, 0);
		vSave.render();
		this.fbo.write.unbind();
	}


	updateFbo() {
		this.fbo.write.bind();
		GL.clear(0, 0, 0, 1);
		this.vSim.render(
			this.fbo.read.getTexture(1), 
			this.fbo.read.getTexture(0), 
			this.fbo.read.getTexture(2)
		);
		this.fbo.write.unbind();

		this.fbo.swap();
	}

	renderParticles() {
		let p = this.count / Config.skipCount;
		this.vRender.render(
			this.fbo.write.getTexture(0), 
			this.fbo.read.getTexture(0), 
			p, 
			this.fbo.read.getTexture(2),
			this.shadowMatrix, 
			this.fboShadow.getDepthTexture(),
			this.fboParticle.getTexture()
		);
	}

	renderShadowMap() {
		this.fboShadow.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.cameraLight);
		let p = this.count / Config.skipCount;
		this.vRenderShadow.render(
			this.fbo.write.getTexture(0), 
			this.fbo.read.getTexture(0), 
			p, 
			this.fbo.read.getTexture(2)
		);
		this.fboShadow.unbind();
	}


	_updateParticleTexture() {
		this.cameraOrtho.lookAt(this.camera.position, [0, 0, 0]);
		this.fboParticle.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.cameraOrtho);
		this.shaderSphere.bind();
		GL.draw(this.meshSphere);
		this.fboParticle.unbind();
	}

	render() {
		this._updateParticleTexture();
		this.count ++;
		if(this.count % Config.skipCount == 0) {
			this.count = 0;
			this.updateFbo();
		}

		this.renderShadowMap();
		GL.clear(0, 0, 0, 0);


		this.fboRender.bind();
		const g = 0.0;
		GL.clear(g, g, g, 1);
		GL.setMatrices(this.camera);

		GL.disable(GL.DEPTH_TEST);
		this.vBg.render();
		GL.enable(GL.DEPTH_TEST);
		this.vBelt.render();
		this.renderParticles();
		this.fboRender.unbind();

		GL.clear(0, 0, 0, 1);

		this.passBloom.render(this.fboRender.getTexture());
		this.vFxaa.render(this.fboRender.getTexture(), this.passBloom.getTexture());

		

		// GL.disable(GL.DEPTH_TEST);
		// GL.viewport(0, 0, 100, 100);
		// this._bCopy.draw(this.fboParticle.getTexture());
	}


	toResize(w, h) {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		w = w || innerWidth;
		h = h || innerHeight;
		GL.setSize(w, h);
		let tw = Math.min(w, innerWidth);
		let th = Math.min(h, innerHeight);

		const sx = innerWidth / w;
		const sy = innerHeight / h;
		const scale = Math.min(sx, sy);
		tw = w * scale;
		th = h * scale;

		GL.canvas.style.width = `${tw}px`;
		GL.canvas.style.height = `${th}px`;
		this.camera.setAspectRatio(GL.aspectRatio);

		this.fboRender = new alfrid.FrameBuffer(GL.width, GL.height, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
	}

	resize() {
		this.toResize(window.innerWidth, window.innerHeight);
	}
}


export default SceneApp;
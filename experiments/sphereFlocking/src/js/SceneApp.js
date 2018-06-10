// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewRenderShadow from './ViewRenderShadow';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';
import fs from 'shaders/normal.frag';
import Config from './Config';
import Settings from './Settings';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		Settings.init();

		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/3, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 15;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;

		this._cameraLight = new alfrid.CameraOrtho();
		const s = 10;
		this._cameraLight.ortho(-s, s, -s, s, 1, 50);
		// this._cameraLight.lookAt([0, 10, 0.1], [0, 0, 0], [0, 1, 0]);
		this._cameraLight.lookAt([0, 10, 0], [0, 0, 0], [0, 0, -1]);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);

		//	get particle normal map
		const size = 1;
		this.cameraOrtho.ortho(-size, size, -size, size);
		this.cameraOrtho.lookAt([0, 0, 3], [0, 0, 0]);
		const mesh = alfrid.Geom.sphere(1, 12);
		const shader = new alfrid.GLShader(null, fs);
		this._fboParticle.bind();
		// GL.clear(1, 0, 0, 1);
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.cameraOrtho);
		shader.bind();
		GL.draw(mesh);
		this._fboParticle.unbind();


		this._hit = vec3.create();
		this._preHit = vec3.create();
		this._speed = 0;
		const meshHit = alfrid.Geom.sphere(Config.sphereSize, 24);
		this._detector = new TouchDetector(meshHit, this.camera);

		this._detector.on('onHit', (e)=> {
			vec3.copy(this._preHit, this._hit);
			vec3.copy(this._hit, e.detail.hit);
		});

		this._detector.on('onUp', (e)=> {
			vec3.copy(this._preHit, [999, 0, 0]);
			vec3.copy(this._hit, [999, 0, 0]);
		});

		setTimeout(()=> {
			gui.add(Config, 'numParticles', 10, 256).step(1).onFinishChange(Settings.reload);	
			gui.add(Config, 'radius', 0, 3).onChange(Settings.refresh);	
			gui.add(Config, 'speed', 0, 10).onChange(Settings.refresh);	
		}, 500);

		
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = Config.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT
		};

		this._fboCurrent  	= new alfrid.FrameBuffer(numParticles, numParticles, o, 3);
		this._fboTarget  	= new alfrid.FrameBuffer(numParticles, numParticles, o, 3);

		const shadowMapSize = 1024 * 2;
		this._fboShadow = new alfrid.FrameBuffer(shadowMapSize, shadowMapSize, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
		const s = 32 * 2;
		this._fboParticle = new alfrid.FrameBuffer(s, s, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._vFloor = new ViewFloor();


		//	views
		this._vRender = new ViewRender();
		this._vRenderShadow = new ViewRenderShadow();
		this._vSim 	  = new ViewSim();

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


	updateFbo() {
		this._speed = vec3.distance(this._hit, this._preHit);

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(
			this._fboCurrent.getTexture(1), 
			this._fboCurrent.getTexture(0), 
			this._fboCurrent.getTexture(2),
			this._hit,
			this._speed
			);
		this._fboTarget.unbind();


		let tmp          = this._fboCurrent;
		this._fboCurrent = this._fboTarget;
		this._fboTarget  = tmp;

	}

	_renderParticles() {
		let p = this._count / Config.skipCount;
		this._vRender.render(
			this._fboTarget.getTexture(0), 
			this._fboCurrent.getTexture(0), 
			p, 
			this._fboCurrent.getTexture(2),
			this._shadowMatrix, 
			this._fboShadow.getDepthTexture(),
			this.textureParticle,
			this._fboTarget.getTexture(1)
		);
	}

	_renderShadowMap() {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight);
		let p = this._count / Config.skipCount;
		this._vRenderShadow.render(
			this._fboTarget.getTexture(0), 
			this._fboCurrent.getTexture(0), 
			p, 
			this._fboCurrent.getTexture(2)
		);
		this._fboShadow.unbind();
	}


	render() {

		this._count ++;
		if(this._count % Config.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		this._renderShadowMap();

		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);
		// this._bAxis.draw();
		// this._bDots.draw();

		this._renderParticles();
		this._vFloor.render(this._shadowMatrix, this._fboShadow.getDepthTexture());

		let s = .1;
		// this._bBall.draw(this._hit, [s, s, s], [1, 0, 0]);

		s = 32;
		GL.viewport(0, 0, s, s);
		// this._bCopy.draw(this._fboParticle.getTexture());
		// this._bCopy.draw(this._fboShadow.getDepthTexture());

		// GL.viewport(s, 0, s, s);
		// this._bCopy.draw(this._fboShadow.getTexture());
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}


	get textureParticle() {
		return this._fboParticle.getTexture();
	}
}


export default SceneApp;
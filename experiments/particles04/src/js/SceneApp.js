// SceneApp.js

import alfrid, { Scene, GL, TouchDetector} from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewRenderShadow from './ViewRenderShadow';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';
import ViewLine from './ViewLine';
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
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 1.1;
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


		setTimeout(()=> {
			gui.add(Config, 'numParticles', 10, 1024).step(1).onFinishChange(Settings.reload);	
		}, 500);

	

		this.mesh = alfrid.Geom.sphere(Config.maxRadius * 1.5, 12 * 4, true);
		this.shader = new alfrid.GLShader();		

		this._dir = vec3.fromValues(0, 0, 1);
		this._avoid = vec3.create();
		this._preHit = vec3.fromValues(0, 0, 0);
		this._hit = vec3.fromValues(0, 0, 0);
		this._radius = new alfrid.EaseNumber(0);
		this._detector = new TouchDetector(this.mesh, this.camera);
		this._detector.on('onHit', (e)=> {
			vec3.copy(this._preHit, this._hit);
			vec3.copy(this._hit, e.detail.hit);
			this._radius.value = 1;
		})

		this._detector.on('onUp', ()=> {
			vec3.copy(this._preHit, vec3.fromValues(0, 0, 0));
			vec3.copy(this._hit, vec3.fromValues(0, 0, 0));
			vec3.copy(this._dir, vec3.fromValues(0, 1, 0));
			this._radius.value = 0;
		})
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

		this._fboShadow = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
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
		this._vLine = new ViewLine();


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
		this._fboTarget.bind();
		GL.clear(0, 0, 0, 1);
		this._vSim.render(
			this._fboCurrent.getTexture(1), 
			this._fboCurrent.getTexture(0), 
			this._fboCurrent.getTexture(2),
			this._hit,
			this._radius.value,
			this._dir
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
			this.textureParticle
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
		vec3.sub(this._dir, this._hit, this._preHit);
		vec3.normalize(this._dir, this._dir);
		// vec3.scale(this._dir, this._dir, 1);
		vec3.add(this._avoid, this._dir, this._hit);

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
		this._vLine.render(this._avoid, this._hit);
		// const s = 32;
		// GL.viewport(0, 0, s, s);
		// this._bCopy.draw(this._fboParticle.getTexture());
		// this._bCopy.draw(this._fboShadow.getDepthTexture());

		// GL.viewport(s, 0, s, s);
		// this._bCopy.draw(this._fboShadow.getTexture());

		// this.shader.bind();
		// GL.draw(this.mesh);

		let s = 0.1 * this._radius.value;
		this._bBall.draw(this._hit, [s, s, s], [1, 0, 0]);
		s = 0.2 * this._radius.value;
		this._bBall.draw(this._avoid, [s, s, s], [0, 1, 0]);
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
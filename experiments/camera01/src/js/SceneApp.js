// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewRenderShadow from './ViewRenderShadow';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';
import ViewBars from './ViewBars';
import fs from 'shaders/normal.frag';
import Config from './Config';
import Settings from './Settings';
import saveImage from './saveImage';


const scissor = function(x, y, w, h) {
	GL.scissor(x, y, w, h);
	GL.viewport(x, y, w, h);
}


class SceneApp extends alfrid.Scene {
	constructor() {
		Settings.init();



		super();
		GL.gl.enable(GL.gl.SCISSOR_TEST);
		this._isPaused = false;

		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 30);
		this.orbitalControl.radius.value = 10;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;


		this.cameras = [];
		let i = 4;
		const RAD = Math.PI / 180;
		const cameraDist = 10;
		while(i--) {
			const camera = new alfrid.CameraPerspective();
			camera.setPerspective(120 * RAD, GL.aspectRatio, .1, 100);
			const control = new alfrid.OrbitalControl(camera);
			control.rx.easing = control.ry.easing = 0.01 * (i+1);

			control.radius.setTo(cameraDist);
			control.radius.limit(cameraDist-2, cameraDist + 2);
			control.rx.setTo(0.3);
			control.ry.setTo(0.3);

			this.cameras.push(camera);
		}

		this._cameraLight = new alfrid.CameraOrtho();
		const s = 10;
		this._cameraLight.ortho(-s, s, -s, s, 1, 50);
		this._cameraLight.lookAt(Config.lightPos, [0, 1, 0], [0, 0, -1]);

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


		// setTimeout(()=> {
		// 	gui.add(Config, 'numParticles', 10, 128).step(1).onFinishChange(Settings.reload);	
		// 	gui.add(Config, 'gap', 0, 30).step(1).onChange(Settings.refresh);
		// }, 500);

		this.resize();

		window.addEventListener('keydown', (e)=> {
			console.log(e.keyCode);

			if(e.keyCode === 69) {
				// this.export();
			}
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
		this._vBars = new ViewBars();


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
		this._vSim.render(this._fboCurrent.getTexture(1), this._fboCurrent.getTexture(0), this._fboCurrent.getTexture(2));
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
		// let p = this._count / Config.skipCount;
		// this._vRenderShadow.render(
		// 	this._fboTarget.getTexture(0), 
		// 	this._fboCurrent.getTexture(0), 
		// 	p, 
		// 	this._fboCurrent.getTexture(2)
		// );

		this._vBars.renderShadow(
			this._fboTarget.getTexture(0), 
			this._fboCurrent.getTexture(2)
		);

		this._fboShadow.unbind();
	}

	export() {
		this._isPaused = true;
		this.resize(4096);
		this.render(true);
	}


	render(mForce=false) {
		if(this._isPaused && !mForce) {
			return;
		}
		const { gap } = Config;
		this._count ++;
		if(this._count % Config.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		// this._renderShadowMap();
		GL.clear(0, 0, 0, 0);


/*/
		const w = (GL.width - gap * 3)/4;
		this.cameras.forEach( (camera, i) => {
			GL.setMatrices(camera);
			GL.scissor(i * (w + gap), 0, w, GL.height);	
			this._vBars.render(
				this._fboTarget.getTexture(0), 
				this._fboCurrent.getTexture(2),
				this._shadowMatrix, 
				this._fboShadow.getDepthTexture()
			);
		});
/*/
		const w = (GL.width - gap * 5) / 4;
		const gapY = 0;
		const h = GL.height - gapY * 2;

		this.cameras.forEach( (camera, i) => {
			GL.setMatrices(camera);
			GL.scissor(i * (w + gap) + gap, gapY, w, h);	
			this._vBars.render(
				this._fboTarget.getTexture(0), 
				this._fboCurrent.getTexture(2),
				this._shadowMatrix, 
				this._fboShadow.getDepthTexture()
			);
		});
//*/
		GL.scissor(0, 0, GL.width, GL.height);
	}

	resize(width, height) {
		const ratio = 3;
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		width = width || innerWidth;

		const h = width / ratio;
		GL.canvas.style.width = `${width}px`;
		GL.canvas.style.height = `${h}px`;
		GL.canvas.style.marginTop = `${-h/2}px`;

		GL.setSize(width, h);
		this.camera.setAspectRatio(GL.aspectRatio);

		this.cameras.forEach( camera => {
			camera.setAspectRatio(GL.aspectRatio);			
		});
	}


	get textureParticle() {
		return this._fboParticle.getTexture();
	}
}


export default SceneApp;
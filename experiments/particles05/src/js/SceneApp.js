// SceneApp.js

import alfrid, { Scene, GL, FboPingPong } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewRenderShadow from './ViewRenderShadow';
import ViewSim from './ViewSim';
import ViewFloor from './ViewFloor';
import Config from './Config';
import ParticleTexture from './ParticleTexture';
import { resize } from './utils';


import fsAO from 'shaders/ssao.frag';
import fsCompose from 'shaders/compose.frag';
import fsFXAA from 'shaders/fxaa.frag';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(Math.PI/2, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 10;
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;

		this._cameraLight = new alfrid.CameraOrtho();
		const s = 10;
		this._cameraLight.ortho(-s, s, s, -s, 1, 50);
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


		let _fsAO = fsAO.replace('${NUM_SAMPLES}', Config.ssaoSamples).replace('${NUM_RINGS}', Config.ssaoRings);
		this._dAO = new alfrid.Draw()
			.useProgram(alfrid.ShaderLibs.bigTriangleVert, _fsAO)
			.setMesh(alfrid.Geom.bigTriangle())
			.uniform('uDimension', 'vec2', [GL.width, GL.height])
			.bindFrameBuffer(this._fboAO);

		this._dCompose = new alfrid.Draw()
			.useProgram(alfrid.ShaderLibs.bigTriangleVert, fsCompose)
			.setMesh(alfrid.Geom.bigTriangle())
			.bindFrameBuffer(this._fboOutput)

		this._dFxaa = new alfrid.Draw()
			.useProgram(alfrid.ShaderLibs.bigTriangleVert, fsFXAA)
			.setMesh(alfrid.Geom.bigTriangle())
			.uniform('uDimension', 'vec2', [GL.width, GL.height])
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = Config.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT,
			mipmap:false
		};

		// this._fbo 			= new FboPingPong(numParticles, numParticles, o, 3);
		this._fbos = [];
		let i = Config.numSets;
		while(i--) {
			this._fbos.push(new FboPingPong(numParticles, numParticles, o, 3));
		}

		this._fbos.forEach(fbo => {
			fbo.read.getTexture(0).minFilter = GL.NEAREST;
			fbo.read.getTexture(0).magFilter = GL.NEAREST;

			fbo.write.getTexture(0).minFilter = GL.NEAREST;
			fbo.write.getTexture(0).magFilter = GL.NEAREST;
		});

		this._fboShadow = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
		this._textureParticle = new ParticleTexture();


		const fboScale = 1.0;

		console.log(GL.width, GL.width >> 1);

		this._fboRender = new alfrid.FrameBuffer(GL.width * fboScale, GL.height * fboScale);
		this._fboAO = new alfrid.FrameBuffer(GL.width * fboScale, GL.height * fboScale, {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
		});
		this._fboOutput = new alfrid.FrameBuffer(GL.width * fboScale, GL.height * fboScale);
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

		this._fbos.forEach( fbo => {
			this._vSave = new ViewSave();
			fbo.read.bind();
			GL.clear(0, 0, 0, 0);
			this._vSave.render();
			fbo.read.unbind();	
		});
		

		GL.setMatrices(this.camera);
	}


	updateFbo() {
		this._fbos.forEach( fbo => {
			fbo.write.bind();
			GL.clear(0, 0, 0, 1);
			this._vSim.render(
				fbo.read.getTexture(1), 
				fbo.read.getTexture(0), 
				fbo.read.getTexture(2));
			fbo.write.unbind();
			fbo.swap();	
		})
		
	}


	_renderParticles() {
		let p = this._count / Config.skipCount;
		this._fbos.forEach( fbo => {
			this._vRender.render(
				fbo.write.getTexture(0), 
				fbo.read.getTexture(0), 
				p, 
				fbo.read.getTexture(2),
				this._shadowMatrix, 
				this._fboShadow.getDepthTexture(),
				this.textureParticle
			);	
		})
		
	}

	_renderShadowMap() {
		this._fboShadow.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraLight);
		let p = this._count / Config.skipCount;

		this._fbos.forEach( fbo => {
			this._vRenderShadow.render(
				fbo.read.getTexture(0), 
				fbo.read.getTexture(0), 
				p, 
				fbo.read.getTexture(2)
			);	
		})
		
		this._fboShadow.unbind();
	}


	render() {

		this._count ++;
		if(this._count % Config.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		this._renderShadowMap();

		GL.clear(1, 1, 1, 1);

		this._fboRender.bind();
		GL.clear(1, 1, 1, 1);
		GL.setMatrices(this.camera);
		this._renderParticles();
		this._fboRender.unbind();



		this._dAO
			.uniform('uStrength', 'float', Config.aoStrength)
			.uniformTexture('texture', this._fboRender.depthTexture, 0)
			.draw()

		this._dCompose
			.uniformTexture('textureBase', this._fboRender.texture, 0)
			.uniformTexture('textureAO', this._fboAO.texture, 1)
			.draw()


		this._dFxaa
			.uniformTexture('texture', this._fboOutput.texture, 0)
			.draw();
	}



	resize(w, h) {
		resize(w, h);
		this.camera.setAspectRatio(GL.aspectRatio);
	}


	get textureParticle() {
		return this._textureParticle.getTexture();
	}
}


export default SceneApp;
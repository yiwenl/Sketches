// SceneApp.js

import alfrid, { Scene, GL, FboPingPong } from 'alfrid';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewRenderShadow from './ViewRenderShadow';
import ViewSim from './ViewSim';
import ViewModel from './ViewModel';
import Config from './Config';
import Assets from './Assets';
import ParticleTexture from './ParticleTexture';

import fsBg from 'shaders/bg.frag';
import FaceTracking from './FaceTracking';

window.getAsset = function(id) {
	return assets.find( (a) => a.id === id).file;
}

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this._count = 0;
		this.camera.setPerspective(60 * Math.PI/180, GL.aspectRatio, .1, 100);
		this.orbitalControl.radius.value = 12;
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = -0.1;

		this._cameraLight = new alfrid.CameraOrtho();
		const s = 10;
		this._cameraLight.ortho(-s, s, s, -s, 1, 50);
		// this._cameraLight.lookAt([0, 10, 0.1], [0, 0, 0], [0, 1, 0]);
		this._cameraLight.lookAt([0, 10, 5], [0, 0, 0]);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);
		this._shadowMatrix = mat4.create();
		mat4.multiply(this._shadowMatrix, this._cameraLight.projection, this._cameraLight.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);

		this.cameraFront = new alfrid.CameraPerspective();
		this.cameraFront.setPerspective(30 * Math.PI / 180, GL.aspectRatio, 1, 30);
		this.cameraFront.lookAt([0, 0, 22], [0, 0, 0]);

		this._depthMatrix = mat4.create();
		mat4.multiply(this._depthMatrix, this.cameraFront.projection, this.cameraFront.viewMatrix);
		mat4.multiply(this._depthMatrix, this._biasMatrix, this._depthMatrix);


		this.mtx = mat4.create();

		this._nose = vec3.create();
		this._preNose = vec3.create();

		FaceTracking.init()
		.then(()=> {
			console.log('done');

			FaceTracking.on('onFace', (o)=>this._onFace(o))
		}, (e)=> {
			console.log('Error' ,e);
		});
		
	}

	_initTextures() {
		console.log('init textures');

		//	FBOS
		const numParticles = Config.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
			type:GL.FLOAT,
		};

		// this._fbo 			= new FboPingPong(numParticles, numParticles, o, 3);
		this._fbos = [];
		let i = Config.numSets;
		while(i--) {
			this._fbos.push(new FboPingPong(numParticles, numParticles, o, 4));
		}

		this._fbos.forEach(fbo => {
			fbo.read.getTexture(0).minFilter = GL.NEAREST;
			fbo.read.getTexture(0).magFilter = GL.NEAREST;

			fbo.write.getTexture(0).minFilter = GL.NEAREST;
			fbo.write.getTexture(0).magFilter = GL.NEAREST;
		});

		this._fboShadow = new alfrid.FrameBuffer(1024, 1024, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
		this._textureParticle = new ParticleTexture();

		const fboSize = 2048;
		this._fboModel = new alfrid.FrameBuffer(fboSize, fboSize, o, 2);
		this._hasCapture = false;

		console.log('Num particles : ', numParticles * numParticles * Config.numSets);
	}


	_initViews() {
		console.log('init views');
		
		//	helpers
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vModel = new ViewModel();


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

		this.drawBg = new alfrid.Draw()
			.useProgram(alfrid.ShaderLibs.bigTriangleVert, fsBg)
			.setMesh(alfrid.Geom.bigTriangle())
			.uniformTexture('texture', Assets.get('lutMap'))
		

		GL.setMatrices(this.camera);
	}

	_onFace(o) {
		const { rx, ry, rz, x, y, scale } = o;

		mat4.identity(this.mtx);
		mat4.scale(this.mtx, this.mtx, vec3.fromValues(scale, scale, scale));
		mat4.rotateX(this.mtx, this.mtx, -rx);
		mat4.rotateY(this.mtx, this.mtx, ry);
		mat4.rotateZ(this.mtx, this.mtx, -rz);
		const xyScale = 0.025;
		let tx = x * xyScale;
		let ty = y * xyScale + 2;
		mat4.translate(this.mtx, this.mtx, vec3.fromValues(tx, ty, 0));

		

		vec3.copy(this._preNose, this._nose);
		this._nose[0] = tx;
		this._nose[1] = ty;
		this._nose[2] = 1.5;

		this._capture();
	}


	updateFbo() {
		this._fbos.forEach( fbo => {
			fbo.write.bind();
			GL.clear(0, 0, 0, 1);
			this._vSim.render(
				fbo.read.getTexture(1), 
				fbo.read.getTexture(0), 
				fbo.read.getTexture(2),
				this._fboModel.getTexture(0),
				this._depthMatrix,
				this._nose,
				this._preNose
				);
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
				this.textureParticle,
				fbo.read.getTexture(3),
				this._depthMatrix,
				this._fboModel.getTexture(1),
				this._fboModel.getTexture(0)
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


	_capture() {
		if(!this._vModel.isReady) {
			return;
		}

		// if(this._hasCapture) {
		// 	return;
		// }

		GL.setMatrices(this.cameraFront);
		this._fboModel.bind();
		GL.clear(0.1, 0.1, 0.1, 0.5);
		GL.rotate(this.mtx);
		this._vModel.render();
		this._fboModel.unbind();


		this._hasCapture = true;
	}


	render() {

		let s;

		if(!this._hasCapture) { return; }

		GL.setMatrices(this.camera);

		this._count ++;
		if(this._count % Config.skipCount == 0) {
			this._count = 0;
			this.updateFbo();
		}

		this._renderShadowMap();

		GL.clear(205/255, 31/255, 14/255, 1);
		GL.clear(0, 0, 0, 1);
		GL.setMatrices(this.camera);

		this._renderParticles();

		s = 2;
		// this._bBall.draw(this._nose, [s, s, s], [1, 0, 0], .5);

		// this._vModel.render();

		// this._vModel.render();
		// this._bBall.draw([0, 0, 10], [.1, .1, .1], [1, 0 ,0])
		s = 256;
		GL.viewport(0, 0, s, s);
		// this._bCopy.draw(this.textureParticle);
/*/
		
		GL.viewport(0, 0, s, s/GL.aspectRatio);
		this._bCopy.draw(this._fboModel.getTexture());
		GL.viewport(s, 0, s, s/GL.aspectRatio);
		this._bCopy.draw(this._fboModel.getTexture(1));
//*/		
	}



	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		// GL.setSize(innerWidth, innerHeight);
		GL.setSize(1080, 1350);
		this.camera.setAspectRatio(GL.aspectRatio);
	}


	get textureParticle() {
		return this._textureParticle.getTexture();
	}
}


export default SceneApp;
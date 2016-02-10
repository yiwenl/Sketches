// SceneApp.js
import alfrid from './libs/alfrid.js';
import ViewCube from './ViewCube';
import ViewSave from './ViewSave';
import ViewRender from './ViewRender';
import ViewSimulation from './ViewSimulation';
import ViewTestRender from './ViewTestRender';
import ViewShadowRender from './ViewShadowRender';
import ViewSphere from './ViewSphere';

var Leap = require("leapjs");

let GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		GL = alfrid.GL;
		GL.enableAlphaBlending();
		super();

		console.log(Leap);
		Leap.loop((frame)=>this._onLeapFrame(frame));


		this.lightPosition      = [.5, 10, 1];
		this._vLight.position   = this.lightPosition;
		this.shadowMatrix       = mat4.create();
		
		this.touchRight         = [1000, 0, 0];
		this.pinchStrengthRight = 0;
		this.touchLeft          = [1000, 0, 0];
		this.pinchStrengthLeft  = 0;
		this.time               = 0;
		
		this.cameraLight   = new alfrid.CameraPerspective();
		let fov            = 90*Math.PI/180;
		let near           = .5;
		let far            = 400;
		this.camera.setPerspective(fov, GL.aspectRatio, near, far);
		this.cameraLight.setPerspective(fov*3, GL.aspectRatio, near, far);
		this.cameraLight.lookAt(this.lightPosition, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
		mat4.multiply(this.shadowMatrix, this.cameraLight.projection, this.cameraLight.viewMatrix);

		this.orbitalControl._rx.value = .6;
		// this.orbitalControl._ry.value = -.8;
		this.orbitalControl.radius.value = 15.3;
		this.orbitalControl.lockZoom(true);
		this._count = 0;
	}


	_initTextures() {
		console.log('Init textures');

		//	FBOS
		const numParticles = params.numParticles;
		const o = {
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST
		}
		this._fboCurrent = new alfrid.FrameBuffer(numParticles*2, numParticles*2, o);
		this._fboTarget  = new alfrid.FrameBuffer(numParticles*2, numParticles*2, o);
		
		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
		this._fboShadowMap = new alfrid.FrameBuffer(1024, 1024);
	}
	

	_initViews() {
		console.log('Init Views');
		this._bAxis         = new alfrid.BatchAxis();
		this._bDotsPlane    = new alfrid.BatchDotsPlane();
		this._bCopy         = new alfrid.BatchCopy();
		
		this._vSim          = new ViewSimulation();
		this._vRender       = new ViewRender();
		this._vShadowRender = new ViewShadowRender();
		this._vCube         = new ViewCube([0, 0, 0], [1, 1, 1], [1, 1, .5]);
		this._vLight        = new ViewCube([1, 15, 1], [.2, .2, .2], [1, 0, 0]);
		let grey            = .9
		this._vFloor        = new ViewCube([0, -9, 0], [50, 0.1, 30], [grey, grey, grey * .98]);
		this._vSphere       = new ViewSphere();

		

		this._vTestRender = new ViewTestRender();

		//	SAVE INIT POSITIONS
		this._vSave = new ViewSave();
		GL.setMatrices(this.cameraOrtho);

		this._fboCurrent.bind();
		GL.clear(0, 0, 0, 0);
		this._vSave.render();

		this._fboCurrent.unbind();
		GL.viewport(0, 0, GL.width, GL.height);
		GL.setMatrices(this.camera);


		this.meshSphere = alfrid.Geom.sphere(1, 24);
		this.shaderColor = new alfrid.GLShader(alfrid.ShaderLibs.generalVert, alfrid.ShaderLibs.simpleColorFrag);
	}


	updateFbo() {
		GL.setMatrices(this.cameraOrtho);

		this._fboTarget.bind();
		GL.clear(0, 0, 0, 0);
		this._vSim.render(this._fboCurrent.getTexture(), this.touchRight, this.pinchStrengthRight+2, this.touchLeft, this.pinchStrengthLeft+2);
		this._fboTarget.unbind();
		GL.viewport(0, 0, GL.width, GL.height);
		GL.setMatrices(this.camera);

		//	PING PONG
		var tmp = this._fboTarget;
		this._fboTarget = this._fboCurrent;
		this._fboCurrent = tmp;
	}

	_onLeapFrame(frame) {
		function map(value, sx, sy, tx, ty ) {
			let p = (value - sx) / (sy - sx);
			// p = Math.min(Math.max(p, 0.0), 1.0);
			if(p < 0.0) p = 0.0;
			else if(p > 1.0) p = 1.0;

			return tx + p * (ty - tx);
		}

		//	RESETTING
		this.touchRight         = [999, 999, 999];
		this.pinchStrengthRight = 0;
		this.touchLeft          = [999, 999, 999];
		this.pinchStrengthLeft  = 0;

		let touch, pinchStrength;
		let range = 8;
		for(var i=0; i<frame.hands.length; i++) {
			
			pinchStrength = frame.hands[i].pinchStrength * 3.0;
			let pos       = frame.hands[i].palmPosition;
			
			let x         = map(pos[0], -250, 250, -range, range);
			let y         = map(pos[1], 50, 450, -range, range);
			let z         = map(pos[2], -200, 200, -range, range);
			
			let type      = frame.hands[i].type;

			if(type == 'right') {
				this.touchRight = [x, y, z];
				this.pinchStrengthRight = pinchStrength;
			} else {
				this.touchLeft = [x, y, z];
				this.pinchStrengthLeft = pinchStrength;
			}

		}
	}


	render() {
		
		this.time += .01;

		let p = 0;

		if(this._count % params.skipCount === 0) {
			this._count = 0;
			this.updateFbo();
		}
		p = this._count / params.skipCount;
		this._count ++;

		// this.orbitalControl._ry.value += -.01;

		
		//	DRAW SHADOW MAP

		this._fboShadowMap.bind();
		GL.clear(1, 1, 1, 1);
		GL.gl.depthFunc(GL.gl.LEQUAL);
		GL.setMatrices(this.cameraLight);
		this._vRender.render(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p);
		this._fboShadowMap.unbind();

		//	DRAW WITH SHADOW MAP

		GL.viewport(0, 0, GL.width, GL.height);
		GL.setMatrices(this.camera);
		
		this._vFloor.render(this.shadowMatrix, this.lightPosition, this._fboShadowMap.getTexture());
		this._vShadowRender.render(this._fboTarget.getTexture(), this._fboCurrent.getTexture(), p, this._fboShadowMap.getTexture(), this.shadowMatrix, this.lightPosition);
		// this._vSphere.render([0, 0, 0], 1, [1, 0, 0], .5);
		this._vSphere.render(this.touchLeft, params.baseRadius+this.pinchStrengthLeft, this.lightPosition, this.pinchStrengthLeft);
		this._vSphere.render(this.touchRight, params.baseRadius+this.pinchStrengthRight, this.lightPosition, this.pinchStrengthRight);
		/*/
		GL.setMatrices(this.cameraOrtho);
		GL.disable(GL.DEPTH_TEST);
		let size = 256;
		GL.viewport(0, 0, size, size/GL.aspectRatio);
		this._bCopy.draw(this._fboShadowMap.getDepthTexture());
		GL.viewport(size, 0, size, size/GL.aspectRatio);
		this._bCopy.draw(this._fboShadowMap.getTexture());
		GL.enable(GL.DEPTH_TEST);
		/*/
	}
}


export default SceneApp;
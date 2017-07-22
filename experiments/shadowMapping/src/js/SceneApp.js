// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import vs from 'shaders/basic.vert';
import vsShadow from 'shaders/shadow.vert';
import fs from 'shaders/shadow.frag';


import vsDepth from 'shaders/depth.vert';
import fsDepth from 'shaders/depth.frag';

const POINT_SOURCE = [0, 0, 4];
const RAD = Math.PI / 180;

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
		this.orbitalControl.radius.value = 8;


		this._cameraSource = new alfrid.CameraPerspective();
		this._cameraSource.setPerspective(45 * RAD, 1, 1, 100);
		this._cameraSource.lookAt(POINT_SOURCE, [0, 0, 0]);


		this.biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

		this.shadowMatrix = mat4.create();
		mat4.multiply(this.shadowMatrix, this._cameraSource.projection, this._cameraSource.viewMatrix);
		mat4.multiply(this.shadowMatrix, this.biasMatrix, this.shadowMatrix);


		mat4.log = function(m) {
			const c0 = [m[0], m[1], m[2], m[3]];
			const c1 = [m[4], m[5], m[6], m[7]];
			const c2 = [m[8], m[9], m[10], m[11]];
			const c3 = [m[12], m[13], m[14], m[15]];
			console.table([c0, c1, c2, c3]);
		}

		mat4.log(this.biasMatrix);
		mat4.log(this.shadowMatrix);

		const v = vec3.fromValues(-1, 0, 1);
		vec3.transformMat4(v, v, this.biasMatrix);

		this.renderFromLight = false;

		this.bias = 0.001;
		gui.add(this, 'renderFromLight');
		gui.add(this, 'moveToLightSource');
		gui.add(this, 'bias', 0, 0.01)
	}


	moveToLightSource() {
		this.orbitalControl.radius.value = 4;
		this.orbitalControl.rx.value = 0;
		this.orbitalControl.ry.value = 0;
	}

	_initTextures() {
		console.log('init textures');
		this.fboDepth = new alfrid.FrameBuffer(1024, 1024, {type:GL.FLOAT, minFilter:GL.NEAREST, magFilter:GL.NEAREST});
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._bBall = new alfrid.BatchBall();


		this._shaderDepth = new alfrid.GLShader(vsDepth, fsDepth);
		this._shaderShadow = new alfrid.GLShader(vsShadow, fs);
		this._meshCube   = alfrid.Geom.cube(1, 1, 1);
		this._meshSphere = alfrid.Geom.sphere(.5, 24);
		const planeSize = 5;
		this._meshPlane  = alfrid.Geom.plane(planeSize, planeSize, 1);
	}


	render() {
		// this.orbitalControl.ry.value += 0.01;
		GL.clear(0, 0, 0, 0);

		this._bAxis.draw();
		this._bDots.draw();


		this.fboDepth.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraSource);
		this.renderScene();
		this.fboDepth.unbind();

		if(this.renderFromLight) {
			this.camera.lookAt(POINT_SOURCE, [0, 0, 0]);
		} 
		GL.setMatrices(this.camera);	
		
		this.renderScene(this.fboDepth.getDepthTexture());

		const s = 256;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this.fboDepth.getDepthTexture());
	}


	renderScene(texture) {

		const isShadow = !!texture;
		const shader = isShadow ? this._shaderShadow : this._shaderDepth;

		shader.bind();

		if(isShadow) {
			shader.uniform("uShadowMatrix", "uniformMatrix4fv", this.shadowMatrix);
			shader.uniform("uBias", "float", this.bias);

			shader.uniform("textureDepth", "uniform1i", 0);
			texture.bind(0);

			shader.uniform("textureMap", "uniform1i", 1);
			Assets.get('ink').bind(1);
		}

		shader.uniform("uPosition", "vec3", [-0.25, 0, -1]);
		GL.draw(this._meshCube);
		shader.uniform("uPosition", "vec3", [0.25, 0.25, 0.5]);
		GL.draw(this._meshSphere);

		shader.uniform("uPosition", "vec3", [0, 0, -2]);
		GL.draw(this._meshPlane);
		
		const s = .05;
		this._bBall.draw(POINT_SOURCE, [s, s, s], [1, .5, .25]);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
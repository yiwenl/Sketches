// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import vs from 'shaders/basic.vert';
import fs from 'shaders/shadow.frag';

const POINT_SOURCE = [0, 0, 5];
const RAD = Math.PI / 180;

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
		this.orbitalControl.radius.value = 8;


		this._cameraSource = new alfrid.CameraPerspective();
		this._cameraSource.setPerspective(45 * RAD, 1, .5, 100);
		this._cameraSource.lookAt(POINT_SOURCE, [0, 0, 0]);

	}

	_initTextures() {
		console.log('init textures');
		this.fboDepth = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox();

		this._bBall = new alfrid.BatchBall();


		this._shaderDepth = new alfrid.GLShader(vs);
		this._shaderShadow = new alfrid.GLShader(vs, fs);
		this._meshCube = alfrid.Geom.cube(1, 1, 1);
		this._meshSphere = alfrid.Geom.sphere(.5, 24);
	}


	render() {
		// this.orbitalControl.ry.value += 0.01;
		GL.clear(0, 0, 0, 0);

		this._bSky.draw(Assets.get('irr'));

		this._bAxis.draw();
		this._bDots.draw();


		this.fboDepth.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this._cameraSource);
		this.renderScene();
		this.fboDepth.unbind();

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
		shader.uniform("uPosition", "vec3", [-0.25, 0, -1]);
		GL.draw(this._meshCube);
		shader.uniform("uPosition", "vec3", [0.25, 0.25, 0.5]);
		GL.draw(this._meshSphere);
		
		const s = .25;
		this._bBall.draw(POINT_SOURCE, [s, s, s]);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import ViewCubes from './ViewCubes';
import fsLines from 'shaders/lines.frag';
import fsCorner from 'shaders/corner.frag';

const canvasSize = 0.006;

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;


		this.cameraOrtho = new alfrid.CameraOrtho();
		const w = window.innerWidth * canvasSize;
		const h = w/GL.aspectRatio;
		this.cameraOrtho.ortho(-w, w, -h, h, -1000.1, 1000);

		this.control = new alfrid.OrbitalControl(this.cameraOrtho, window, 100);
		// this.control.lock(true);
		const RAD = Math.PI/180;
		this.control.rx.value = 35.4 * RAD;
		this.control.ry.value = -45 * RAD;
	}

	_initTextures() {
		console.log('init textures');

		const size = 512;
		this._fboPattern = new alfrid.FrameBuffer(size*2, size, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});

		const shaderCorner = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsCorner);
		const shaderLines = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsLines);
		const mesh = new alfrid.Geom.bigTriangle();
		const num = 10;

		this._fboPattern.bind();
		GL.clear(1, 0, 0, 1);

		GL.viewport(0, 0, size, size);
		shaderLines.bind();
		shaderLines.uniform('num', 'float', num);
		GL.draw(mesh);

		GL.viewport(size, 0, size, size);
		shaderCorner.bind();
		shaderCorner.uniform('num', 'float', num);
		GL.draw(mesh);
		this._fboPattern.unbind();
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._vCubes = new ViewCubes();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		GL.setMatrices(this.cameraOrtho);

		this._vCubes.render(this.texture);


		// const s = 200;
		// GL.viewport(0, 0, s * 2, s);
		// this._bCopy.draw(this.texture);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);

		const w = window.innerWidth * canvasSize;
		const h = w/GL.aspectRatio;
		this.cameraOrtho.ortho(-w, w, -h, h, -1000.1, 1000);
	}


	get texture() {
		return this._fboPattern.getTexture();
	}
}


export default SceneApp;
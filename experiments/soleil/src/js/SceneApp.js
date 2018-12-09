// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

import ViewNoise from './ViewNoise';
import FboPingPong from './FboPingPong';

import fsAdd from 'shaders/add.frag';
import fsBlur from 'shaders/blur.frag';

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;


		let s = 0.3;
		this.mtx = mat4.create();
		mat4.rotateX(this.mtx, this.mtx, Math.PI/2);
		mat4.scale(this.mtx, this.mtx, vec3.fromValues(s, s, s));
	}

	_initTextures() {
		console.log('init textures');

		const s = 1024;
		const oSettings = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR
		}
		this._fbo = new FboPingPong(s, s, oSettings);
		this._fboBlur = new FboPingPong(s, s, oSettings);
		this._fboRender = new alfrid.FrameBuffer(s, s, oSettings);
		this._fboNoise = new alfrid.FrameBuffer(s, s, oSettings);
		this._fboAdd = new alfrid.FrameBuffer(s, s, oSettings);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._vNoise = new ViewNoise();


		this.mesh = Assets.get('torus');
		this.meshTri = alfrid.Geom.bigTriangle();
		this.shader = new alfrid.GLShader(null, alfrid.ShaderLibs.simpleColorFrag);

		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 1, 1]);
		this.shader.uniform("opacity", "float", 1);

		this.shaderBlur = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsBlur);
		this.shaderAdd = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsAdd);
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._bAxis.draw();
		this._bDots.draw();


		//	RENDER SCENE
		this._fboRender.bind();

		GL.clear(0, 0, 0, 0);
		this.shader.bind();
		GL.rotate(this.mtx);
		GL.draw(this.mesh);

		this._fboRender.unbind();


		//	ADD OLD SCENE
		this._fboAdd.bind();
		GL.clear(0, 0, 0, 0);
		this.shaderAdd.bind();
		this.shaderAdd.uniform("texture0", "uniform1i", 0);
		this._fbo.readTexture.bind(0);
		this.shaderAdd.uniform("texture1", "uniform1i", 1);
		this._fboRender.getTexture().bind(1);
		GL.draw(this.meshTri);
		this._fboAdd.unbind();

		//	APPLY NOISE 
		this._fboNoise.bind();
		GL.clear(0, 0, 0, 0);
		this._vNoise.render(this._fboAdd.getTexture());
		this._fboNoise.unbind();


		this.shaderBlur.bind();
		this.shaderBlur.uniform("uResolution", "vec2", [1024, 1024]);


		let i = 3;

		while(i--) {
			this._fboBlur.write.bind();
			GL.clear(0, 0, 0, 0);
			this.shaderBlur.uniform("uDirection", "vec2", [1, 0]);
			this.shader.uniform("texture", "uniform1i", 0);
			this._fboNoise.getTexture().bind(0);
			GL.draw(this.meshTri);
			this._fboBlur.write.unbind();
			this._fboBlur.swap();

			this._fboBlur.write.bind();
			GL.clear(0, 0, 0, 0);
			this.shaderBlur.uniform("uDirection", "vec2", [0, 1]);
			GL.draw(this.meshTri);
			this._fboBlur.readTexture.bind(0);
			this._fboBlur.write.unbind();
			this._fboBlur.swap();
		}

		

		this._fbo.write.bind();
		GL.clear(0, 0, 0, 0);
		this._bCopy.draw(this._fboBlur.readTexture);
		this._fbo.write.unbind();
		this._fbo.swap();

		this._bCopy.draw(this._fboBlur.readTexture);
		// this._bCopy.draw(this._fboAdd.getTexture());

		GL.disable(GL.DEPTH_TEST);
		let s = 300;
		GL.viewport(0, 0, s, s / GL.aspectRatio);
		this._bCopy.draw(this._fboRender.getTexture());
		GL.viewport(s, 0, s, s / GL.aspectRatio);
		this._bCopy.draw(this._fboAdd.getTexture());
		GL.viewport(s * 2, 0, s, s / GL.aspectRatio);
		this._bCopy.draw(this._fboNoise.getTexture());
		// GL.viewport(s * 2, 0, s, s / GL.aspectRatio);
		// this._bCopy.draw(this._fboBlur.readTexture);

		GL.enable(GL.DEPTH_TEST);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
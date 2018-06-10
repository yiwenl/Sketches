// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';
import fs from 'shaders/blur.frag';

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;

		setTimeout(()=> {
			gui.add(Config, 'blurStrength', 0, 5).onFinishChange(Settings.refresh);
			gui.add(Config, 'noise', 0, 5).onFinishChange(Settings.refresh);
			gui.add(Config, 'speed', 0, 5).onFinishChange(Settings.refresh);
		})
	}

	_initTextures() {
		console.log('init textures');
		this.texture = Assets.get('river');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox();

		this._vModel = new ViewObjModel();


		this.mesh = alfrid.Geom.bigTriangle();
		this.shader = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fs);

		console.log('texture :', this.texture.width);
		const { width, height } = this.texture;
		this._fbo0 = new alfrid.FrameBuffer(width, height, {minFilter:GL.LINEAR, miagFilter:GL.LINEAR});
		this._fbo1 = new alfrid.FrameBuffer(width, height, {minFilter:GL.LINEAR, miagFilter:GL.LINEAR});

		this.seed = Math.random() * 0xFF;


	}


	render() {
		GL.clear(0, 0, 0, 0);
		const { width, height } = this.texture;
		this.shader.bind();
		this.shader.uniform("uResolution", "vec2", [width, height]);
		this.shader.uniform("uSeed", "float", this.seed + alfrid.Scheduler.deltaTime * Config.speed);
		this.shader.uniform("uNoise", "float", Config.noise);

		this._fbo0.bind();
		GL.clear(0, 0, 0, 0);
		
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("uDirection", "vec2", [0, Config.blurStrength]);
		
		GL.draw(this.mesh);


		this._fbo0.unbind();


		this.shader.uniform("texture", "uniform1i", 0);
		this._fbo0.getTexture().bind(0);
		this.shader.uniform("uDirection", "vec2", [Config.blurStrength, 0]);
	

		/*/		
		GL.draw(this.mesh);
		/*/
		this._bCopy.draw(this._fbo0.getTexture());
		//*/
		
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;
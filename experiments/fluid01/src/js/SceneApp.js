// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';
import FboPingPong from './FboPingPong';
import getTexelSize from './utils/getTexelSize';
import getMesh from './utils/getMesh';
import TouchDetector from './TouchDetector';
import TouchSimulator from './utils/TouchSimulator';

import PassBase from './passes/PassBase';

import fsAdvect from 'shaders/advect.frag';
import fsDivergence from 'shaders/divergence.frag';
import fsClear from 'shaders/clear.frag';
import fsJacobi from 'shaders/jacobi.frag';
import fsGradientSub from 'shaders/gradientSubstract.frag';
import fsSplat from 'shaders/splat.frag';
import fsNormal from 'shaders/normal.frag';
import fsPost from 'shaders/post.frag';

class SceneApp extends Scene {
	constructor() {
		super();
		this.resize();
		GL.enableAlphaBlending();
		this.mouse = [0, 0, 0];


		//	shaders
		this._shaderAdvect = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsAdvect);
		this._shaderAdvect.bind();
		this._shaderAdvect.uniform("velocity", "uniform1i", 0);
		this._shaderAdvect.uniform("x", "uniform1i", 1);
		this._shaderAdvect.uniform("timestep", "float", 0.007);

		this._shaderDivergence = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsDivergence);
		this._shaderDivergence.bind();
		this._shaderDivergence.uniform("velocity", "uniform1i", 0);

		this._shaderClear = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsClear);
		this._shaderClear.bind();
		this._shaderClear.uniform("pressure", "uniform1i", 0);
		this._shaderClear.uniform("dissipation", "float", Config.PRESSURE_DISSIPATION);

		this._shaderJacobi = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsJacobi);
		this._shaderJacobi.bind();
		this._shaderJacobi.uniform("pressure", "uniform1i", 0);
		this._shaderJacobi.uniform("divergence", "uniform1i", 1);

		this._shaderGradientSub = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsGradientSub);
		this._shaderGradientSub.bind();
		this._shaderGradientSub.uniform("pressure", "uniform1i", 0);
		this._shaderGradientSub.uniform("velocity", "uniform1i", 1);

		
		this._shaderSplat = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsSplat);
		this._shaderSplat.bind();
		this._shaderSplat.uniform("texture", "uniform1i", 1);
		this._shaderSplat.uniform("uTarget", "uniform1i", 0);
		// this._texture = Assets.get('texture');
		this._texture = Assets.get('liquid');
		this._texture.minFilter = this._texture.magFilter = GL.LINEAR;
		this._texture.wrapS = this._texture.wrapT = GL.MIRRORED_REPEAT;
		// this._texture.wrapS = this._texture.wrapT = GL.REPEAT;

		this._shaderNormal = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsNormal);
		this._shaderNormal.bind();
		this._shaderNormal.uniform("texture", "uniform1i", 0);

		this._shaderPost = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsPost);
		this._shaderPost.bind();
		this._shaderPost.uniform("textureNormal", "uniform1i", 0);
		this._shaderPost.uniform("textureGradient", "uniform1i", 1);
		this._shaderPost.uniform("textureOverlay", "uniform1i", 2);

		this.enableTouch = true;
		this._touchDetector = new TouchDetector(GL.canvas);
		this._touchDetector.on('onDrag', (e)=> {
			const {x, y, dx, dy } = e.detail;
			if(this.enableTouch) {
				this.createSplat(x, y, dx, dy, 0.001);	
			}
		});


		this._touch = [0, 0];

		for(let i=0; i<Config.NUM_CIRCLES; i++) {
			let scale = i == -1 ? 20 : 0.5;
			const sim = new TouchSimulator(scale, i != 0);
			sim.on('onDrag', (e)=> {
				const {x, y, dx, dy, radius} = e.detail;
				this.createSplat(x, y, dx, dy, radius);
			});
		}

		this.resize();

		this._fade = new alfrid.EaseNumber(0);
		this._opening = new alfrid.TweenNumber(1, 'expOut', 0.02);

	}

	_initTextures() {
		const width = window.innerWidth >> Config.TEXTURE_DOWNSAMPLE;
		const height = window.innerHeight >> Config.TEXTURE_DOWNSAMPLE;

		let type = GL.FLOAT;
		if(GL.isMobile) {
			//	if is ios
			const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
			if(iOS) {
				type = GL.HALF_FLOAT;
			}

		}

		this._fboVelocity   = new FboPingPong(width, height, {minFilter:GL.LINEAR, magFilter:GL.LINEAR, type});
		this._fboDensity    = new FboPingPong(width, height, {minFilter:GL.LINEAR, magFilter:GL.LINEAR, type});
		this._fboPressure   = new FboPingPong(width, height, {minFilter:GL.LINEAR, magFilter:GL.LINEAR, type});
		this._fboDivergence = new alfrid.FrameBuffer(width, height, {minFilter:GL.NEAREST, magFilter:GL.NEAREST, type});
		this._fboNormal     = new alfrid.FrameBuffer(width, height, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});
	}



	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();

		this.mesh = getMesh();
		this._passBase = new PassBase();
	}


	advect(target, textureX, dissipation) {
		target.bind();
		this._shaderAdvect.bind();
		GL.clear(0, 0, 0, 1);
		
		this._shaderAdvect.uniform("texelSize", "vec2", this._texelSize);
		this._shaderAdvect.uniform("dissipation", "float", dissipation);

		this._fboVelocity.readTexture.bind(0);
		textureX.bind(1);

		GL.draw(this.mesh);

		target.unbind();
	}


	createSplat(x, y, dx, dy, radius) {

		radius = radius || Config.SPLAT_RADIUS;

		this._fboVelocity.write.bind();
		GL.clear(0, 0, 0, 1);

		this._shaderSplat.bind();
		this._shaderSplat.uniform("radius", "float", radius);
		this._shaderSplat.uniform("aspectRatio", "float", GL.aspectRatio);
		this._shaderSplat.uniform('point', 'vec2', [x / window.innerWidth, 1 - y / window.innerHeight]);
		let speed = 1;
		this._shaderSplat.uniform("color", "vec3", [dx * speed, -dy * speed, 1]);
		this._shaderSplat.uniform("uIsVelocity", "float", 1.0);

		
		this._fboVelocity.readTexture.bind(0);
		this._texture.bind(1);
		GL.draw(this.mesh);
		this._fboVelocity.write.unbind();
		this._fboVelocity.swap();

		// let g = 0.0075;
		let g = 0.01;
		this._fboDensity.write.bind();
		GL.clear(0, 0, 0, 1);
		this._shaderSplat.uniform("color", "vec3", [g, g, g]);
		this._shaderSplat.uniform("uIsVelocity", "float", 0.0);
		this._fboDensity.readTexture.bind(0);
		GL.draw(this.mesh);
		this._fboDensity.write.unbind();
		this._fboDensity.swap();
	}


	_reDraw() {
		const g = 0.01;
		this._fboDensity.write.bind();
		GL.clear(0, 0, 0, 1);
		this._passBase.render(this._fboDensity.readTexture, this._texture);
		this._fboDensity.write.unbind();
		this._fboDensity.swap();
	}



	render() {
		GL.clear(0, 0, 0, 1);

		this._shaderSplat.bind();
		this._shaderSplat.uniform("uTime", "float", alfrid.Scheduler.deltaTime);

		this._reDraw();

		//	advect - velocity
		this.advect(
			this._fboVelocity.write, 
			this._fboVelocity.readTexture, 
			Config.VELOCITY_DISSIPATION
		);
		this._fboVelocity.swap();


		// //	advect - density
		this.advect(
			this._fboDensity.write, 
			this._fboDensity.readTexture, 
			Config.DENSITY_DISSIPATION
		);
		this._fboDensity.swap();

		//	divergence
		this._fboDivergence.bind();
		GL.clear(0, 0, 0, 1);
		this._shaderDivergence.bind();
		this._shaderDivergence.uniform("texelSize", "vec2", this._texelSize);
		this._fboVelocity.readTexture.bind(0);
		GL.draw(this.mesh);
		this._fboDivergence.unbind();

		//	clear
		this._fboPressure.write.bind();
		GL.clear(0, 0, 0, 1);
		this._shaderClear.bind();
		this._fboPressure.readTexture.bind(0);
		GL.draw(this.mesh);
		this._fboPressure.write.unbind();
		this._fboPressure.swap();

		//	jacobi
		for(let i=0; i<Config.PRESSURE_ITERATIONS; i++) {

			this._fboPressure.write.bind();
			GL.clear(0, 0, 0, 1);

			this._shaderJacobi.bind();
			this._shaderJacobi.uniform("texelSize", "vec2", this._texelSize);
			this._fboPressure.readTexture.bind(0)
			this._fboDivergence.getTexture().bind(1);
			GL.draw(this.mesh);

			this._fboPressure.write.unbind();

			//	swapping texture
			this._fboPressure.swap();
		}

		//	gradient substract
		this._fboVelocity.write.bind();
		GL.clear(0, 0, 0, 1);
		this._shaderGradientSub.bind();
		this._shaderGradientSub.uniform("texelSize", "vec2", this._texelSize);

		this._fboPressure.readTexture.bind(0);
		this._fboVelocity.readTexture.bind(1);

		GL.draw(this.mesh);
		this._fboVelocity.write.unbind();
		this._fboVelocity.swap();


		this._fboNormal.bind();
		GL.clear(0, 0, 0, 1);
		this._shaderNormal.bind();
		this._fboDensity.readTexture.bind(0);
		GL.draw(this.mesh);
		this._fboNormal.unbind();


		//	display
		this._shaderPost.bind();
		this._shaderPost.uniform('uHit', 'vec2', this._touch);
		this._shaderPost.uniform('uFade', 'float', this._fade.value);
		this._shaderPost.uniform('uTime', 'float', alfrid.Scheduler.deltaTime);
		this._shaderPost.uniform('uRatio', 'float', GL.aspectRatio);
		this._shaderPost.uniform('uOpening', 'float', this._opening.value);
		this._shaderPost.uniform("uDimension", "vec2", [GL.width, GL.height]);
		this._fboNormal.getTexture().bind(0);
		Assets.get('gradient').bind(1);
		Assets.get('overlay').bind(2);
		GL.draw(this.mesh);

		// this._bCopy.draw(this._fboDensity.readTexture);
		// this._bCopy.draw(this._fboNormal.getTexture());

		/*/
		GL.disable(GL.DEPTH_TEST);
		const s = 100;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._fboDensity.readTexture);

		GL.viewport(s, 0, s, s);
		this._bCopy.draw(this._fboVelocity.readTexture);

		GL.viewport(s*2, 0, s, s);
		this._bCopy.draw(this._fboPressure.readTexture);

		GL.viewport(s*3, 0, s, s);
		this._bCopy.draw(this._fboDivergence.getTexture());

		GL.enable(GL.DEPTH_TEST);
		//*/
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;

		this._texelSize = getTexelSize();
		console.log('texel size:', window.innerWidth >> Config.TEXTURE_DOWNSAMPLE, window.innerHeight >> Config.TEXTURE_DOWNSAMPLE);

		GL.setSize(innerWidth, innerHeight);

		const w = window.innerWidth/2;
		const h = window.innerHeight/2;
		this.cameraOrtho.ortho(w, -w, -h, h);

		this.camera.setAspectRatio(GL.aspectRatio);
	}

	destroy() {

	}
}


export default SceneApp;
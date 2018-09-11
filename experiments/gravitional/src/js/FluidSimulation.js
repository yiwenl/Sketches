// FluidSimulation.js
import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';
import FboPingPong from './FboPingPong';
import getMesh from './utils/getMesh';
import TouchSimulator from './utils/TouchSimulator';
import BlackHoleSimulator from './utils/BlackHoleSimulator';

import fsAdvect from 'shaders/advect.frag';
import fsDivergence from 'shaders/divergence.frag';
import fsClear from 'shaders/clear.frag';
import fsJacobi from 'shaders/jacobi.frag';
import fsGradientSub from 'shaders/gradientSubstract.frag';
import fsSplat from 'shaders/splat.frag';

class FluidSimulation {
	constructor(mCamera) {
		this.mouse = [0, 0, 0];
		this._camera = mCamera;
		this._texelSize = [1/Config.TEXTURE_SIZE, 1/Config.TEXTURE_SIZE];

		this._initShaders();
		this._initTextures();
		this._initMeshes();
		this._initTouches();
	}


	_initShaders() {
		//	shaders
		this._shaderAdvect = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsAdvect);
		this._shaderAdvect.bind();
		this._shaderAdvect.uniform("velocity", "uniform1i", 0);
		this._shaderAdvect.uniform("x", "uniform1i", 1);
		this._shaderAdvect.uniform("timestep", "float", 0.001);

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
	}


	_initTextures() {
		let index = 1;
		this._texture = alfrid.GLTexture.greyTexture();

		this._texture.minFilter = this._texture.magFilter = GL.NEAREST;
		this._texture.wrapS = this._texture.wrapT = GL.MIRRORED_REPEAT;

		const size = Config.TEXTURE_SIZE;
		let type = GL.FLOAT;
		if(GL.isMobile) {
			const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
			if(iOS) {
				type = GL.HALF_FLOAT;
			}
		}

		const oSettings = {
			minFilter:GL.LINEAR, 
			magFilter:GL.LINEAR, 
			wrapS:GL.MIRRORED_REPEAT, 
			wrapT:GL.MIRRORED_REPEAT, 
			type			
		}

		this._fboVelocity   = new FboPingPong(size, size, oSettings);
		this._fboDensity    = new FboPingPong(size, size, oSettings);
		this._fboPressure   = new FboPingPong(size, size, oSettings);
		this._fboDivergence = new alfrid.FrameBuffer(size, size, oSettings);
	}


	_initMeshes() {
		this.mesh = getMesh();
		// this._passBase = new PassBase();
	}


	_initTouches() {
		this._touch = [0, 0];
		this.enableTouch = true;

		// for(let i=0; i<Config.NUM_CIRCLES; i++) {
		// 	let scale = i == -1 ? 20 : 0.5;
		// 	const sim = new TouchSimulator(scale, i != 0);
		// 	sim.on('onDrag', (e)=> {
		// 		const {x, y, dx, dy, radius} = e.detail;
		// 		this.createSplat(x, y, dx, dy, radius);
		// 	});
		// }

		const theta = Math.random() * Math.PI * 2.0;
		const bh0 = new BlackHoleSimulator(theta);
		bh0.on('onDrag', (e)=> {
			const {x, y, dx, dy, radius} = e.detail;
			// console.log(dx, dy);
			this.createSplat(x, y, dx, dy, radius);
		});

		const bh1 = new BlackHoleSimulator(Math.PI + theta);
		bh1.on('onDrag', (e)=> {
			const {x, y, dx, dy, radius} = e.detail;
			this.createSplat(x, y, dx, dy, radius);
		});

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
		this._shaderSplat.uniform("aspectRatio", "float", 1);
		this._shaderSplat.uniform('point', 'vec2', [x / Config.TEXTURE_SIZE, y / Config.TEXTURE_SIZE]);
		let speed = 1;
		this._shaderSplat.uniform("color", "vec3", [dx * speed, -dy * speed, 1]);
		this._shaderSplat.uniform("uIsVelocity", "float", 1.0);

		
		this._fboVelocity.readTexture.bind(0);
		this._texture.bind(1);
		GL.draw(this.mesh);
		this._fboVelocity.write.unbind();
		this._fboVelocity.swap();

		// let g = 0.0075;
		let g = 0.1;
		this._fboDensity.write.bind();
		GL.clear(0, 0, 0, 1);
		this._shaderSplat.uniform("color", "vec3", [g, g, g]);
		this._shaderSplat.uniform("uIsVelocity", "float", 0.0);
		this._fboDensity.readTexture.bind(0);
		GL.draw(this.mesh);
		this._fboDensity.write.unbind();
		this._fboDensity.swap();
	}


	update() {
		this._shaderSplat.bind();
		this._shaderSplat.uniform("uTime", "float", alfrid.Scheduler.deltaTime);

		// this._reDraw();

		//	advect - velocity
		this.advect(
			this._fboVelocity.write, 
			this._fboVelocity.readTexture, 
			Config.VELOCITY_DISSIPATION
		);
		this._fboVelocity.swap();


		//	advect - density
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
	}


	get velocity() {
		return this._fboVelocity.readTexture;
	}

	get density() {
		return this._fboDensity.readTexture;
	}
}


export default FluidSimulation;
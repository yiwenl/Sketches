// FluidSimulation.js
import alfrid, { GL, FboPingPong } from 'alfrid';
import Assets from './Assets';
import Config from './Config';
import PassBase from './passes/PassBase';
import getMesh from './utils/getMesh';
import Touch from './Touch';
import TouchSimulator from './utils/TouchSimulator';
import Draw from './utils/Draw';

import fsAdvect from 'shaders/advect.frag';
import fsDivergence from 'shaders/divergence.frag';
import fsClear from 'shaders/clear.frag';
import fsJacobi from 'shaders/jacobi.frag';
import fsGradientSub from 'shaders/gradientSubstract.frag';
import fsSplat from 'shaders/splat.frag';
import fsSplat2 from 'shaders/splat2.frag';

class FluidSimulation {
	constructor(mCamera) {
		this.mouse = [0, 0, 0];
		this._camera = mCamera;
		this._texelSize = [1/Config.TEXTURE_SIZE, 1/Config.TEXTURE_SIZE];

		
		this._initTextures();
		this._initTouches();
		this._initShaders();
	}


	_initShaders() {
		const mesh = alfrid.Geom.bigTriangle();
		this.mesh = mesh;
		const vs = alfrid.ShaderLibs.bigTriangleVert;
		//	shaders

		//	draw
		this._drawAdvect = new Draw()
			.useProgram(vs, fsAdvect)
			.setMesh(mesh)
			.setClearColor(0, 0, 0, 1)
			.uniform('uTimestep', 'float', 0.001)
			.uniform('uTexelSize', 'vec2', this._texelSize);

		this._drawDivergence = new Draw()
			.useProgram(vs, fsDivergence)
			.setMesh(mesh)
			.setClearColor(0, 0, 0, 1)
			.bindFrameBuffer(this._fboDivergence)
			.uniform('uTexelSize', 'vec2', this._texelSize);

		this._drawClear = new Draw()
			.useProgram(vs, fsClear)
			.setMesh(mesh)
			.setClearColor(0, 0, 0, 1)
			.uniform("uDissipation", "float", Config.PRESSURE_DISSIPATION);

		this._drawJacobi = new Draw()
			.useProgram(vs, fsJacobi)
			.setMesh(mesh)
			.setClearColor(0, 0, 0, 1)
			.uniform('uTexelSize', 'vec2', this._texelSize);		


		this._drawGradient = new Draw()
			.useProgram(vs, fsGradientSub)
			.setMesh(mesh)
			.setClearColor(0, 0, 0, 1)
			.uniform('uTexelSize', 'vec2', this._texelSize);

		
		this._shaderSplat = new alfrid.GLShader(alfrid.ShaderLibs.bigTriangleVert, fsSplat);
		this._shaderSplat.bind();
		this._shaderSplat.uniform("texture", "uniform1i", 1);
		this._shaderSplat.uniform("uTarget", "uniform1i", 0);

		this._drawSplat = new Draw()
			.useProgram(vs, fsSplat2)
			.setMesh(mesh)
	}


	_initTextures() {
		let index = 1;
		this._texture = Assets.get(`liquid`);

		this._texture.minFilter = GL.LINEAR_MIPMAP_NEAREST;
		this._texture.magFilter = GL.LINEAR;
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
			wrapS:GL.CLAMP_TO_EDGE, 
			wrapT:GL.CLAMP_TO_EDGE, 
			type			
		}

		this._fboVelocity   = new FboPingPong(size, size, oSettings);
		this._fboDensity    = new FboPingPong(size, size, oSettings);
		this._fboPressure   = new FboPingPong(size, size, oSettings);
		this._fboDivergence = new alfrid.FrameBuffer(size, size, oSettings);
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

		this._touchDetect = new Touch(this._camera);

		this._touchDetect.on('onDrag', (e)=> {
			const {x, y, dx, dy, radius} = e.detail;
			this.createSplat(x, y, dx, dy, radius * 3.0);
		});
	}


	advect(target, textureX, dissipation) {

		this._drawAdvect
			.bindFrameBuffer(target)
			.uniformTexture('textureVel', this._fboVelocity.read.texture, 0)
			.uniformTexture('textureMap', textureX, 1)
			.uniform('uDissipation', 'float', dissipation)
			.draw();
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

		this._fboVelocity.read.texture.bind(0);
		this._texture.bind(1);
		GL.draw(this.mesh);
		this._fboVelocity.write.unbind();
		this._fboVelocity.swap();

		// let g = 0.0075;
		let g = 0.0075;
		this._fboDensity.write.bind();
		GL.clear(0, 0, 0, 1);
		this._shaderSplat.uniform("color", "vec3", [g, g, g]);
		this._shaderSplat.uniform("uIsVelocity", "float", 0.0);
		this._fboDensity.read.texture.bind(0);
		GL.draw(this.mesh);
		this._fboDensity.write.unbind();
		this._fboDensity.swap();
	}


	_debugSplat() {
		const radiusScale = 0.6;
		const strength = 100;
		const time = alfrid.Scheduler.deltaTime * 4.0;
		let radius = Math.sin(alfrid.Scheduler.deltaTime) * 0.1 + 0.3;
		this._drawSplat
			.bindFrameBuffer(this._fboVelocity.write)
			.uniform('uTime', 'float', time)
			.uniform('uRadius', 'float', radius * radiusScale)
			.uniform('uStrength', 'float', strength)
			.uniform('uIsVelocity', 'float', 1.0)
			.uniformTexture('texture', this._fboVelocity.read.texture, 0)
			.draw();
		this._fboVelocity.swap();

		this._drawSplat
			.bindFrameBuffer(this._fboDensity.write)
			.uniform('uIsVelocity', 'float', 0.0)
			.uniform('uStrength', 'float', 0.02)
			.uniformTexture('texture', this._fboDensity.read.texture, 0)
			.draw();
		this._fboDensity.swap();


		radius = Math.cos(alfrid.Scheduler.deltaTime) * 0.1 + 0.3;
		this._drawSplat
			.bindFrameBuffer(this._fboVelocity.write)
			.uniform('uTime', 'float', time + Math.PI)
			.uniform('uRadius', 'float', radius * radiusScale)
			.uniform('uStrength', 'float', strength)
			.uniform('uIsVelocity', 'float', 1.0)
			.uniformTexture('texture', this._fboVelocity.read.texture, 0)
			.draw();
		this._fboVelocity.swap();

		this._drawSplat
			.bindFrameBuffer(this._fboDensity.write)
			.uniform('uIsVelocity', 'float', 0.0)
			.uniform('uStrength', 'float', 0.02)
			.uniformTexture('texture', this._fboDensity.read.texture, 0)
			.draw();
		this._fboDensity.swap();
	}


	update() {
		this._debugSplat();

		//	advect - velocity
		this.advect(
			this._fboVelocity.write, 
			this._fboVelocity.read.texture, 
			Config.VELOCITY_DISSIPATION
		);
		this._fboVelocity.swap();


		//	advect - density
		this.advect(
			this._fboDensity.write, 
			this._fboDensity.read.texture, 
			Config.DENSITY_DISSIPATION
		);
		this._fboDensity.swap();

		//	divergence
		this._drawDivergence
			.uniformTexture('textureVel', this._fboVelocity.read.texture, 0)
			.draw();

		//	clear
		this._drawClear
			.bindFrameBuffer(this._fboPressure.write)
			.uniformTexture('texturePressure', this._fboPressure.read.texture, 0)
			.draw();
		this._fboPressure.swap();

		//	jacobi
		for(let i=0; i<Config.PRESSURE_ITERATIONS; i++) {

			this._drawJacobi
				.bindFrameBuffer(this._fboPressure.write)
				.uniformTexture('texturePressure', this._fboPressure.read.texture, 0)
				.uniformTexture('textureDivergence', this._fboDivergence.texture, 1)
				.draw()

			this._fboPressure.swap();
		}

		//	gradient sub
		this._drawGradient
			.bindFrameBuffer(this._fboVelocity.write)
			.uniformTexture('texturePressure', this._fboPressure.read.texture, 0)
			.uniformTexture('textureVel', this._fboVelocity.read.texture, 1)
			.draw();

		this._fboVelocity.swap();
	}


	get velocity() {
		return this._fboVelocity.read.texture;
	}

	get density() {
		return this._fboDensity.read.texture;
	}

	get divergence() {
		return this._fboDivergence.texture
	}

	get pressure() {
		return this._fboPressure.read.texture
	}

	get allTextures() {
		return [
			this.velocity,
			this.density,
			this.divergence,
			this.pressure
		]
	}
}


export default FluidSimulation;
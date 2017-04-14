// PassBloom.js

import alfrid, { GL } from 'alfrid';
import fsTreshold from '../shaders/threshold.frag';
import fsBloom from '../shaders/bloom.frag';
import fsCompose from '../shaders/bloomCompose.frag';

const startingScale = 0.5;

class PassBloom {

	constructor() {
		this._initTextures();
		this._initViews();
	}


	_initTextures(){
		let width = Math.round(GL.width*startingScale);
		let height = Math.round(GL.height*startingScale);

		this._fbos = [];
		for(let i=0; i<params.numMip; i++) {
			const fboV = new alfrid.FrameBuffer(width, height);
			const fboH = new alfrid.FrameBuffer(width, height);
			this._fbos.push({fboV, fboH});

			width = Math.round(width/2);
			height = Math.round(height/2);
		}

		const scale = 1;
		this._fboThreshold = new alfrid.FrameBuffer(GL.width * scale, GL.height * scale);
		this._fboCompose = new alfrid.FrameBuffer(GL.width, GL.height);

	}

	_initViews() {
		//	mesh
		this.mesh = alfrid.Geom.bigTriangle();

		const vsTri = alfrid.ShaderLibs.bigTriangleVert;

		// 	shaders - threshold
		this.shaderThreshold = new alfrid.GLShader(vsTri, fsTreshold);
		this.uniformsThreshold = {
			luminosityThreshold:0.8,
			smoothWidth:0.01,
			defaultOpacity:0,
			defaultColor:[0, 0, 0]
		}

		// const fThreshold = gui.addFolder('threshold');
		// fThreshold.add(this.uniformsThreshold, 'smoothWidth', 0, .5);
		// gui.add(this.uniformsThreshold, 'luminosityThreshold', 0, 1);

		this.shaderThreshold.bind();
		this.shaderThreshold.uniform("texture", "uniform1i", 0);
		this.shaderThreshold.uniform(this.uniformsThreshold);

		//	shaders - mip bloom
		const kernelSizeArray = [3, 5, 7, 9, 11];
		let width = Math.round(GL.width*startingScale);
		let height = Math.round(GL.height*startingScale);

		this._shadersBloom = [];
		for(let i=0; i<params.numMip; i++) {
			let kernelSize = kernelSizeArray[i];
			let fs = fsBloom.replace(/\${kernelRadius}/g, kernelSize);
			const shader = new alfrid.GLShader(vsTri, fs);
			shader.bind();
			shader.uniform("texSize", "vec2", [width, height]);
			this._shadersBloom.push(shader);

			width = Math.round(width/2);
			height = Math.round(height/2);
		}

		//	shader - compose

		this.uniformsCompose = {
			bloomStrength:1.5,
			bloomRadius:0.4
		}

		let fs = fsCompose.replace(/\${NUM_MIPS}/g, params.numMip);
		this.shaderCompose = new alfrid.GLShader(vsTri, fs);
		this.shaderCompose.bind();
		this.shaderCompose.uniform("blurTexture1", "uniform1i", 0);
		this.shaderCompose.uniform("blurTexture2", "uniform1i", 1);
		this.shaderCompose.uniform("blurTexture3", "uniform1i", 2);
		this.shaderCompose.uniform("blurTexture4", "uniform1i", 3);
		this.shaderCompose.uniform("blurTexture5", "uniform1i", 4);
		let tintColor = [];
		for(let i=0; i<params.numMip; i++) {
			tintColor = tintColor.concat([1, 1, 1, 1.0-0.2*i]);
		}
		this.shaderCompose.uniform('bloomTintColors', 'vec4', tintColor);
		this.shaderCompose.uniform(this.uniformsCompose);

		// gui.add(this.uniformsCompose, 'bloomStrength', 0, 5);
		// gui.add(this.uniformsCompose, 'bloomRadius', 0, 1);
		// gui.close();
		// console.log(gui);
	}

	render(texture) {
		this._fboThreshold.bind();
		GL.clear(0, 0, 0, 0);
		this.shaderThreshold.bind();
		
		this.shaderThreshold.uniform(this.uniformsThreshold);
		texture.bind(0);
		GL.draw(this.mesh);
		this._fboThreshold.unbind();

		// return this._fboThreshold.getTexture();
		let inputTexture = this._fboThreshold.getTexture();

		for(let i=0; i<params.numMip; i++) {
			const {fboV, fboH} = this._fbos[i];
			const shader = this._shadersBloom[i];

			shader.bind();
			shader.uniform("texture", "uniform1i", 0);

			//	bloom V
			fboV.bind();
			GL.clear(0, 0, 0, 0);
			shader.uniform("direction", "vec2", [0, 1]);
			inputTexture.bind(0);
			GL.draw(this.mesh);
			fboV.unbind();

			//	bloom H
			fboH.bind();
			GL.clear(0, 0, 0, 0);
			shader.uniform("direction", "vec2", [1, 0]);
			fboV.getTexture().bind(0);
			GL.draw(this.mesh);
			fboH.unbind();

			inputTexture = fboH.getTexture();
		}

		this._fboCompose.bind();
		GL.clear(0, 0, 0, 0);
		this.shaderCompose.bind();
		for(let i=0; i<params.numMip; i++) {
			const { fboH } = this._fbos[i];
			fboH.getTexture().bind(i);
		}
		this.shaderCompose.uniform(this.uniformsCompose);
		GL.draw(this.mesh);
		this._fboCompose.unbind();
	}

	get fbos() {
		return this._fbos;
	}

	getTexture() {
		return this._fboCompose.getTexture();
	}
}

export default PassBloom;
// TextureGenerator.js

import alfrid, { GL } from 'alfrid';
import fsOutline from 'shaders/outline.frag';
import fsLines from 'shaders/lines.frag';
import fsDots from 'shaders/dots.frag';
import fsNoise from 'shaders/noise.frag';
import fsGradient from 'shaders/gradient.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

const size = 1024;
const s = 1024/4;
let vs;

class TextureGenerator {

	constructor() {
		
		this._fbo = new alfrid.FrameBuffer(size, size, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});

		this.update();


		this.mesh = alfrid.Geom.bigTriangle();
		vs = alfrid.ShaderLibs.bigTriangleVert;

		const shaderOutline = new alfrid.GLShader(vs, fsOutline);
		const shaderLines = new alfrid.GLShader(vs, fsLines);
		const shaderDots = new alfrid.GLShader(vs, fsDots);
		const shaderNoise = new alfrid.GLShader(vs, fsNoise);

		this._fbo.bind();
		
		this.drawPattern(0, 0, shaderLines, {angle:0, size:0, numBars:10.0});
		this.drawPattern(s, 0, shaderLines, {angle:Math.PI/4, size:.2, numBars:10.0});
		this.drawPattern(s * 2, 0, shaderLines, {angle:-Math.PI/4, size:.5, numBars:6.0});
		this.drawPattern(s * 3, 0, shaderOutline, {range:0.2});

		this.drawPattern(0, s, shaderDots, {num:10, noiseScale:0, offset:0.5});
		this.drawPattern(s, s, shaderDots, {num:8, noiseScale:1.5, seed:Math.random() * 0xff, offset:0.0});
		this.drawPattern(s * 2, s, shaderDots, {num:12, noiseScale:2.5, seed:Math.random() * 0xff, offset:0.0});
		this.drawPattern(s * 3, s, shaderOutline, {range:0.75});

		this.drawPattern(0, s * 2, shaderNoise, {num:10, noiseScale:30});
		this.drawPattern(s, s * 2, shaderLines, {angle:Math.PI/2, size:.8, numBars:10.0});
		this.drawPattern(s * 2, s * 2, shaderLines, {angle:0, size:.5, numBars:6});
		this.drawPattern(s * 3, s * 2, fsGradient);

		this._fbo.unbind();

	}


	drawPattern(x, y, mShader, uniforms) {
		let shader;
		if(mShader.length) {
			shader = new alfrid.GLShader(vs, mShader);
		} else {
			shader = mShader;
		}

		GL.viewport(x, y, s, s);
		shader.bind();
		if(uniforms) {
			shader.uniform(uniforms);
		}
		GL.draw(this.mesh);
	}

	update() {
		this._fbo.bind();
		GL.clear(0, 0, 0, 0);
		this._fbo.unbind();
	}


	get texture() {
		return this._fbo.getTexture();
	}
}


export default TextureGenerator;
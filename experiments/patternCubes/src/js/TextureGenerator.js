// TextureGenerator.js

import alfrid, { GL } from 'alfrid';
import fsOutline from 'shaders/outline.frag';
import fsLines from 'shaders/lines.frag';
import fsDots from 'shaders/dots.frag';
import fsNoise from 'shaders/noise.frag';
import fsGradient from 'shaders/gradient.frag';
import fsColorDots from 'shaders/colorDots.frag';

import gradients from './gradients.json';

var random = function(min, max) { return min + Math.random() * (max - min);	}

const size = 1024;
const s = size/4;
let vs;

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

class TextureGenerator {

	constructor() {
		this.step = 0;

		let grd = gradients[Math.floor(Math.random() * gradients.length)].colors;
		grd = grd.map(c => hexToRgb(c));
		this.color0 = [grd[0].r/255, grd[0].g/255, grd[0].b/255];
		this.color1 = [grd[1].r/255, grd[1].g/255, grd[1].b/255];
		this.time = Math.random() * 0xff;

		this._fbo = new alfrid.FrameBuffer(size, size, {minFilter:GL.LINEAR, magFilter:GL.LINEAR, wrapS:GL.CLAMP_TO_EDGE, wrapT:GL.CLAMP_TO_EDGE});

		


		this.mesh = alfrid.Geom.bigTriangle();
		vs = alfrid.ShaderLibs.bigTriangleVert;

		this.shaderOutline = new alfrid.GLShader(vs, fsOutline);
		this.shaderLines = new alfrid.GLShader(vs, fsLines);
		
		this.shaderDots = new alfrid.GLShader(vs, fsDots);
		this.shaderNoise = new alfrid.GLShader(vs, fsNoise);

		this.shaderColorDots = new alfrid.GLShader(vs, fsColorDots);

		this.update();

	}


	drawPattern(x, y, mShader, uniforms) {
		let shader;
		if(mShader.length) {
			shader = new alfrid.GLShader(vs, mShader);
		} else {
			shader = mShader;
		}

		const b = 0.001;

		GL.viewport(x+b/2, y+b/2, s-b, s-b);
		shader.bind();
		if(uniforms) {
			shader.uniform(uniforms);
		}
		GL.draw(this.mesh);
	}


	draw() {
		const {
			shaderOutline,
			shaderLines,
			shaderDots,
			shaderNoise,
			shaderColorDots,
			color0,
			color1
		} = this;

		this._fbo.bind();
		GL.clear(231/255, 227/255, 226/255, 1);
		this.drawPattern(0, 0, shaderLines, {angle:0, size:0, numBars:10.0});
		this.drawPattern(s, 0, shaderLines, {angle:Math.PI/4, size:.3, numBars:8.0});
		this.drawPattern(s * 2, 0, shaderLines, {angle:-Math.PI/4, size:.5, numBars:6.0});
		this.drawPattern(s * 3, 0, shaderOutline, {range:0.2});

		this.drawPattern(0, s, shaderDots, {num:10, noiseScale:0, offset:0.5});
		this.drawPattern(s, s, shaderDots, {num:8, noiseScale:1.5, seed:99+ this.time, offset:0.0});
		// this.drawPattern(s * 2, s, shaderDots, {num:12, noiseScale:2.5, seed:Math.random() * 0xff, offset:0.0});
		this.drawPattern(s * 3, s, shaderOutline, {range:0.75});

		this.drawPattern(0, s * 2, shaderNoise, {num:10, noiseScale:30, seed:this.time});
		this.drawPattern(s, s * 2, shaderLines, {angle:Math.PI/2, size:.8, numBars:10.0});
		this.drawPattern(s * 2, s * 2, shaderLines, {angle:0, size:.5, numBars:6});
		this.drawPattern(s * 3, s * 2, fsGradient);

		this.drawPattern(0, s * 3, shaderColorDots, {num:10, noiseScale:0, offset:0.5, color0, color1, opacity:0});
		this.drawPattern(s, s * 3, shaderColorDots, {num:10, noiseScale:0, offset:0.5, color0, color1, opacity:1});
		this.drawPattern(s * 2, s * 3, shaderColorDots, {num:12, noiseScale:3, seed:1832.23 + this.time, offset:0.0, opacity:1});
		// this.drawPattern(s * 3, s * 3, shaderColorLines, {angle:Math.PI/2, size:.2, numBars:10.0, color0, color1});

		this._fbo.unbind();
	}

	update() {
		this.step++;
		if(this.step % 2 === 0) {
			return;
		}

		this.time += 0.003 * 2;
		this.draw();
	}


	get texture() {
		return this._fbo.getTexture();
	}
}


export default TextureGenerator;
// ViewGiant.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import Params from './Params';

import vs from 'shaders/giant.vert';
import fs from 'shaders/giant.frag';

import vsOutline from 'shaders/giantOutline.vert';
import fsOutline from 'shaders/outline.frag';

class ViewGiant extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.shaderOutline = new alfrid.GLShader(vsOutline, fsOutline);
		this.fogHeight = new alfrid.EaseNumber(2);
		this.fogHeight.value = 0;
		this.time = 0;
	}


	_init() {
		this.mesh = Assets.get('kuafu');


		this._textureColor0 = Assets.get('color0');
		this._textureColor1 = Assets.get('color1');
		this._textureColor2 = Assets.get('color2');
		this._textureColor3 = Assets.get('color3');
		this._textureMap = Assets.get('matColor');

		this.shader.bind();
		this.shader.uniform("uRotation", "float", 0);
		this.shader.uniform('uAoMap', 'uniform1i', 0);
		this.shader.uniform("uMatMap", "uniform1i", 1);
		this.shader.uniform("video0", "uniform1i", 2);
		this.shader.uniform("video1", "uniform1i", 3);
		this.shader.uniform("video2", "uniform1i", 4);
		this.shader.uniform("video3", "uniform1i", 5);
		this.shader.uniform('uRadianceMap', 'uniform1i', 6);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 7);
	}


	render(textureRad, textureIrr, textureAO, mtx) {
		this.shader.bind();
		
		textureAO.bind(0);
		this._textureMap.bind(1);
		this._textureColor0.bind(2);
		this._textureColor1.bind(3);
		this._textureColor2.bind(4);
		this._textureColor3.bind(5);
		textureRad.bind(6);
		textureIrr.bind(7);

		this.shader.uniform("uFogColor", "vec3", Params.shaderFogColor);
		this.shader.uniform("uMatrix", "uniformMatrix4fv", mtx);
		this.shader.uniform("uFogHeight", "float", this.fogHeight.value);

		let opacity = 1.0 - this.fogHeight.value / 2.0;
		opacity = opacity * 2.0;
		if(opacity > 1.0) opacity = 1.0;

		this.shader.uniform("uOpacity", "float", opacity);
		GL.draw(this.mesh);

		this.time += 0.01;
		const shader = this.shaderOutline;

		shader.bind();
		shader.uniform("uTime", "float", this.time);
		shader.uniform("uOutlineWidth", "float", Params.outlineWidth);
		shader.uniform("uOutlineNoise", "float", Params.outlineNoise);
		shader.uniform("uOutlineNoiseStrength", "float", Params.outlineNoiseStrength);

		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.mesh);
		GL.gl.cullFace(GL.gl.BACK);
	}


}

export default ViewGiant;
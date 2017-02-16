// ViewBall.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from '../shaders/pbr.vert';
import fs from '../shaders/pbr.frag';
import vsOutline from 'shaders/outline.vert';
import fsOutline from 'shaders/outline.frag';

class ViewBall extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.shaderOutline = new alfrid.GLShader(vsOutline, fsOutline);
	}


	_init() {
		const size = 20;
		this.mesh = alfrid.Geom.sphere(size, 24 * 2);
		this.meshGiant = Assets.get('kuafu');

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
		this.position = [0, -size + 0.5, 0];
		this.scale = [1, 1, 1];
		const s = 0.5;
		this.scaleGiant = [s, s, s];
	}


	render(textureRad, textureIrr) {
		this.shader.bind();

		this.shader.uniform('uRadianceMap', 'uniform1i', 0);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 1);
		textureRad.bind(0);
		textureIrr.bind(1);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);
		this.shader.uniform("uPosition", "vec3", this.position);
		this.shader.uniform("uScale", "vec3", this.scale);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);

		//	render giant
		this.shader.uniform("uPosition", "vec3", [0, 0.5, 0]);
		this.shader.uniform("uScale", "vec3", this.scaleGiant);
		GL.draw(this.meshGiant);

		this.shaderOutline.bind();
		this.shaderOutline.uniform("uPosition", "vec3", this.position);
		this.shaderOutline.uniform("uScale", "vec3", this.scale);
		this.shaderOutline.uniform("uTime", "float", params.time);
		this.shaderOutline.uniform("uOutlineWidth", "float", params.outlineWidth);
		this.shaderOutline.uniform("uOutlineNoise", "float", params.outlineNoise);
		this.shaderOutline.uniform("uOutlineNoiseStrength", "float", params.outlineNoiseStrength);

		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.mesh);

		this.shaderOutline.uniform("uPosition", "vec3", [0, 0.5, 0]);
		this.shaderOutline.uniform("uScale", "vec3", this.scaleGiant);
		GL.draw(this.meshGiant);
		GL.gl.cullFace(GL.gl.BACK);

	}


}

export default ViewBall;
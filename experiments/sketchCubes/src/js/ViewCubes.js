// ViewCubes.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cubes.vert';
import fs from 'shaders/cubes.frag';

import vsOutline from 'shaders/cubesOutline.vert';
import fsOutline from 'shaders/outline.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.shaderOutline = new alfrid.GLShader(vsOutline, fsOutline);
	}


	_init() {
		// this.mesh = alfrid.Geom.cube(1, 1, 1);
		this.mesh = alfrid.Geom.sphere(1, 24);

		const posOffset = [];
		const extras = [];
		let r, a;
		for(let i=0; i<params.numCubes; i++) {
			a = Math.random() * Math.PI * 2.0;
			r = random(1, 10);
			let v = vec3.fromValues(Math.cos(a) * r, random(5, 1), Math.sin(a) * r);
			posOffset.push(v);

			extras.push([random(.01, .05), random(0.02, 0.05)]);
		}

		this.mesh.bufferInstance(posOffset, 'aPosOffset');
		this.mesh.bufferInstance(extras, 'aExtra');

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
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

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);
		this.shader.uniform("uTime", "float", params.time);

		GL.draw(this.mesh);

		this.shaderOutline.bind();
		this.shaderOutline.uniform("uTime", "float", params.time);
		this.shaderOutline.uniform("uOutlineWidth", "float", params.outlineWidth);
		this.shaderOutline.uniform("uOutlineNoise", "float", params.outlineNoise);
		this.shaderOutline.uniform("uOutlineNoiseStrength", "float", params.outlineNoiseStrength);
		this.shaderOutline.uniform("uViewport", "vec2", [GL.width, GL.height]);

		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.mesh);
		GL.gl.cullFace(GL.gl.BACK);

	}


}

export default ViewCubes;
// ViewBars.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import Assets from './Assets';
import vs from 'shaders/bars.vert';
import fs from 'shaders/bars.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewBars extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this.shaderShadow = new alfrid.GLShader(vs, alfrid.ShaderLibs.simpleColorFrag);

		this.shaderShadow.bind();
		this.shaderShadow.uniform('color', 'vec3', [1, 1, 1]);
		this.shaderShadow.uniform('opacity', 'float', 1);
	}


	_init() {
		const xy = .1;
		const z = 1;
		this.mesh = alfrid.Geom.cube(xy, xy, z);

		const { numParticles } = Config;
		const uvs = [];
		const axis = [];
		let ux, uy;

		const getAxis = () => {
			let axis = vec3.fromValues(random(-1, 1), random(-1, 1), random(-1, 1));
			vec3.normalize(axis, axis);
			return axis;
		}

		for(let i=0; i<numParticles; i++) {
			for(let j=0; j<numParticles; j++) {
				ux = i / numParticles;
				uy = j / numParticles;

				uvs.push([ux, uy]);
			}
		}

		this.mesh.bufferInstance(uvs, 'aUV');
	}


	render(texturePos, textureExtra, mShadowMatrix, mTextureDepth) {
		this.shader.bind();
		this.shader.uniform("texturePos", "uniform1i", 0);
		texturePos.bind(0);
		this.shader.uniform("textureExtra", "uniform1i", 1);
		textureExtra.bind(1);
		this.shader.uniform("textureGradient", "uniform1i", 2);
		Assets.get('gradient').bind(2);
		
		this.shader.uniform("uLight", "vec3", Config.lightPos);
		this.shader.uniform("uDimension", "vec2", [GL.width, GL.height]);
		GL.draw(this.mesh);
	}


	renderShadow(texturePos, textureExtra) {
		const shader = this.shader;
		shader.bind();
		shader.uniform("texturePos", "uniform1i", 0);
		texturePos.bind(0);
		shader.uniform("textureExtra", "uniform1i", 1);
		textureExtra.bind(1);
		shader.uniform("uLight", "vec3", Config.lightPos);
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime);
		GL.draw(this.mesh);
	}


}

export default ViewBars;
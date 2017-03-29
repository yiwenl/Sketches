// ViewRender.js

import alfrid, { GL }from 'alfrid';
const vsRender = require('../shaders/render.vert');
const fsRender = require('../shaders/render.frag');

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewRender extends alfrid.View {
	
	constructor() {
		super(vsRender, fsRender);
		this.time = Math.random() * 0xFFF;
	}


	_init() {
		const scale = 0.30;
		const size = 0.5;
		// this.mesh = new alfrid.Geom.cube(0.025 * scale, 0.5 * scale, 1 * scale);
		this.mesh = new alfrid.Geom.cube(size * scale, size * scale, size * scale);

		const uv = [];
		const extra = [];
		let numParticles = params.numParticles;
		let ux, uy;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				uv.push([ux, uy]);
				extra.push([random(.5, 1), 1, random(1, 1.5)]);
			}
		}

		this.mesh.bufferInstance(uv, 'aUV');
		this.mesh.bufferInstance(extra, 'aExtra');


		this.shader.bind();
		this.shader.uniform('textureCurr', 'uniform1i', 0);
		this.shader.uniform('textureNext', 'uniform1i', 1);
	}


	render(textureCurr, textureNext, p, textureExtra, lightPos) {
		this.time += 0.1;
		this.shader.bind();
		textureCurr.bind(0);
		textureNext.bind(1);
		this.shader.uniform("uLightPos", "vec3", lightPos);
		this.shader.uniform("uPercent", "float", p);
		this.shader.uniform('uTime', 'float', this.time);
		GL.draw(this.mesh);
	}


}

export default ViewRender;
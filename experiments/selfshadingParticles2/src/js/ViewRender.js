// ViewRender.js

import alfrid from 'alfrid';
const vsRender = require('../shaders/render.vert');
const fsRender = require('../shaders/render.frag');

const vsShadowRender = require('../shaders/shadow.vert');
const fsShadowRender = require('../shaders/shadow.frag');
let GL = alfrid.GL;

class ViewRender extends alfrid.View {
	
	constructor() {
		super(vsRender, fsRender);
		this.shaderShadow = new alfrid.GLShader(vsShadowRender, fsShadowRender);
		this.time = Math.random() * 0xFFF;
	}


	_init() {
		let positions    = [];
		let coords       = [];
		let indices      = []; 
		let count        = 0;
		let numParticles = params.numParticles;
		let ux, uy;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;
				positions.push([ux, uy, 0]);
				indices.push(count);
				count ++;

			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);
	}


	render(textureCurr, textureNext, p, textureExtra, shadowMatrix, textureDepth) {
		this.time += 0.1;
		const isShadowMap = shadowMatrix === undefined;
		// console.log('is shadow map ? ', isShadowMap);

		const shader = isShadowMap ? this.shader : this.shaderShadow;

		shader.bind();
		shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		shader.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		if(textureDepth) {
			shader.uniform("uShadowMatrix", "uniformMatrix4fv", shadowMatrix);
			shader.uniform("textureDepth", "uniform1i", 3);
			textureDepth.bind(3);
		}

		shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		shader.uniform('percent', 'float', p);
		shader.uniform('time', 'float', this.time);
		shader.uniform("isShadowMap", "float", isShadowMap ? 1.0 : 0.0);
		GL.draw(this.mesh);
	}


}

export default ViewRender;
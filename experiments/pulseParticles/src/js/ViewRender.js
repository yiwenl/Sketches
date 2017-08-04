// ViewRender.js

import alfrid, { GL } from 'alfrid';
import vsRender from 'shaders/render.vert';
import fsRender from 'shaders/render.frag';
import fsShadow from 'shaders/shadowMap.frag';

class ViewRender extends alfrid.View {
	
	constructor() {
		super(vsRender, fsRender);

		this.shaderSimple = new alfrid.GLShader(vsRender, fsShadow);
		this.shaderSimple.bind();
		this.shaderSimple.uniform('color', 'vec3', [1, 1, 1]);
		this.shaderSimple.uniform("opacity", "float", 1);
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
		this.shader.bind();

		this.shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		this.shader.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		this.shader.uniform("textureDepth", "uniform1i", 3);
		textureDepth.bind(3);

		this.shader.uniform("bias", "float", params.bias);
		this.shader.uniform("uShadowMatrix", "mat4", shadowMatrix);
		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform('percent', 'float', p);
		this.shader.uniform("fixSize", "float", 0);
		GL.draw(this.mesh);
	}


	renderShadow(textureCurr, textureNext, p, textureExtra, shadowMatrix) {
		this.shaderSimple.bind();

		this.shaderSimple.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shaderSimple.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		this.shaderSimple.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		this.shaderSimple.uniform("uShadowMatrix", "mat4", shadowMatrix);
		this.shaderSimple.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shaderSimple.uniform('percent', 'float', p);
		this.shaderSimple.uniform("fixSize", "float", 3);
		GL.draw(this.mesh);
	}


}

export default ViewRender;
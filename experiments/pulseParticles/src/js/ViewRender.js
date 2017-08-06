// ViewRender.js

import alfrid, { GL } from 'alfrid';
import vsRender from 'shaders/render.vert';
import fsRender from 'shaders/render.frag';
import fsShadow from 'shaders/shadowMap.frag';

class ViewRender extends alfrid.View {
	
	constructor(shadowMatrix) {
		super(vsRender, fsRender);

		this.shaderSimple = new alfrid.GLShader(vsRender, fsShadow);
		this.shaderSimple.bind();
		this.shaderSimple.uniform('color', 'vec3', [1, 1, 1]);
		this.shaderSimple.uniform("opacity", "float", 1);


		this._mtxGlobal = mat4.create();
		mat4.rotateY(this._mtxGlobal, this._mtxGlobal, 2.3);
		mat4.rotateX(this._mtxGlobal, this._mtxGlobal, 0.7);
		mat4.translate(this._mtxGlobal, this._mtxGlobal, vec3.fromValues(0, -2, 0));


		this.shaderSimple.bind();
		this.shaderSimple.uniform("uGlobalMatrix", "mat4", this._mtxGlobal);
		this.shaderSimple.uniform("uShadowMatrix", "mat4", shadowMatrix);
		this.shaderSimple.uniform("fixSize", "float", 3);
		this.shaderSimple.uniform('textureCurr', 'uniform1i', 0);
		this.shaderSimple.uniform('textureNext', 'uniform1i', 1);
		this.shaderSimple.uniform('textureExtra', 'uniform1i', 2);

		this.shader.bind();
		this.shader.uniform("bias", "float", params.bias);
		this.shader.uniform("light", "vec3", params.light);
		this.shader.uniform("uGlobalMatrix", "mat4", this._mtxGlobal);
		this.shader.uniform("uShadowMatrix", "mat4", shadowMatrix);
		this.shader.uniform("fixSize", "float", 0);
		this.shader.uniform('textureCurr', 'uniform1i', 0);
		this.shader.uniform('textureNext', 'uniform1i', 1);
		this.shader.uniform('textureExtra', 'uniform1i', 2);
		this.shader.uniform("textureDepth", "uniform1i", 3);
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
		textureCurr.bind(0);
		textureNext.bind(1);
		textureExtra.bind(2);
		textureDepth.bind(3);

		
		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform('percent', 'float', p);
		
		GL.draw(this.mesh);
	}


	renderShadow(textureCurr, textureNext, p, textureExtra, shadowMatrix) {
		this.shaderSimple.bind();
		textureCurr.bind(0);
		textureNext.bind(1);
		textureExtra.bind(2);

		
		this.shaderSimple.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shaderSimple.uniform('percent', 'float', p);
		GL.draw(this.mesh);
	}


}

export default ViewRender;
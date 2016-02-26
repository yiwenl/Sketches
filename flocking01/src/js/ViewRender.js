// ViewRender.js

import alfrid from './libs/alfrid.js';

let glslify = require("glslify");

let GL;

class ViewRender extends alfrid.View {
	constructor() {
		GL = alfrid.GL;
		super(glslify('../shaders/render.vert'), glslify('../shaders/render.frag'));
	}

	_init() {
		let positions    = [];
		let coords       = [];
		let indices      = []; 
		let count        = 0;
		let numParticles = params.numParticles;
		let ux, uy;

		for(let j=0; j<numParticles; j++) {
			for(let i=0; i<numParticles; i++) {
				ux = i/numParticles;
				uy = j/numParticles;
				positions.push([ux, uy, 0]);
				indices.push(count);
				count ++;

			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndices(indices);
	}


	render(texture, textureExtra) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureExtra", "uniform1i", 1);
		textureExtra.bind(1);
		GL.draw(this.mesh);
	}
}


export default ViewRender;
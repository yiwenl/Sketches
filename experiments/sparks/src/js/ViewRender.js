// ViewRender.js

import alfrid from 'alfrid';
const vsRender = require('../shaders/render.vert');
const fsRender = require('../shaders/render.frag');
let GL = alfrid.GL;

class ViewRender extends alfrid.View {
	
	constructor() {
		super(vsRender, fsRender);
		this.time = Math.random() * 0xFFF;
	}


	_init() {
		let positions    = [];
		let coords       = [];
		let indices      = [];
		let uv 			 = [];
		let count        = 0;
		let numParticles = params.numParticles;
		let ux, uy, s, t;
		const num 		 = 8;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				ux = i / numParticles;
				uy = j / numParticles;

				s = Math.floor(Math.random() * num) / num;
				t = Math.floor(Math.random() * num) / num;

				positions.push([ux, uy, 0]);
				uv.push([s, t]);
				indices.push(count);
				count ++;
			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferData(uv, 'aUV');
		this.mesh.bufferIndex(indices);
	}


	render(textureCurr, textureNext, p, textureExtra, textureParticle) {
		this.time += 0.1;
		this.shader.bind();

		this.shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		this.shader.uniform('textureExtra', 'uniform1i', 2);
		textureExtra.bind(2);

		this.shader.uniform("textureParticle", "uniform1i", 3);
		textureParticle.bind(3);

		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform('percent', 'float', p);
		this.shader.uniform('time', 'float', this.time);
		GL.draw(this.mesh);
	}


}

export default ViewRender;
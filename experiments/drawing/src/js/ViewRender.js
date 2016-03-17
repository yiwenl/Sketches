// ViewRender.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewRender extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/render.vert'), glslify('../shaders/render.frag'));
	}


	_init() {
		let num         = params.numParticles;
		let positions   = [];
		let coords      = [];
		let pointCoords = [];
		let indices     = [];
		let count       = 0;
		let size        = 0.03;

		for(let j=0; j<num; j++) {
			for(let i=0; i<num; i++) {
				positions.push([i/num, j/num, 0]);
				indices.push(count);

				count ++;
			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndices(indices);


		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		this.shader.uniform("textureExtra", "uniform1i", 2);
		this.shader.uniform("textureConstellation", "uniform1i", 3);
		this.shader.uniform("numSlides", "uniform1f", 1.0/params.numSlides);
	}


	render(texture, textureNext, textureExtra, percent, textureConstellation, index) {
		let x = (index % params.numSlides) / params.numSlides;
		let y = (Math.floor(index/params.numSlides)) / params.numSlides;
		this.shader.bind();
		texture.bind(0);
		textureNext.bind(1);
		textureExtra.bind(2);
		textureConstellation.bind(3);
		this.shader.uniform("percent", "uniform1f", percent);
		this.shader.uniform("uvOffset", "uniform2fv", [x, y]);
		GL.draw(this.mesh);
	}


}

export default ViewRender;
// ViewPlanes.js


import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewPlanes extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/planes.vert'), glslify('../shaders/planes.frag'));
	}


	_init() {

		let num = params.numParticles;
		let positions = [];
		let coords = [];
		let indices = [];
		let count = 0;
		let size = .02;

		for(let j=0; j<num; j++) {
			for(let i=0; i<num; i++) {
				positions.push([-size,  size, 0]);
				positions.push([ size,  size, 0]);
				positions.push([ size, -size, 0]);
				positions.push([-size, -size, 0]);

				coords.push([i/num, j/num]);
				coords.push([i/num, j/num]);
				coords.push([i/num, j/num]);
				coords.push([i/num, j/num]);

				indices.push(count*4 + 0);
				indices.push(count*4 + 1);
				indices.push(count*4 + 2);
				indices.push(count*4 + 0);
				indices.push(count*4 + 2);
				indices.push(count*4 + 3);

				count ++;
			}
		}

		this.mesh;
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewPlanes;
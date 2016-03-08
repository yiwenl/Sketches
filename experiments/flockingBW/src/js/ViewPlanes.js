// ViewPlanes.js


import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
let glslify = require("glslify");

class ViewPlanes extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/planes.vert'), glslify('../shaders/planes.frag'));
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
				positions.push([-size,  size, 0]);
				positions.push([ size,  size, 0]);
				positions.push([ size, -size, 0]);
				positions.push([-size, -size, 0]);

				coords.push([i/num, j/num]);
				coords.push([i/num, j/num]);
				coords.push([i/num, j/num]);
				coords.push([i/num, j/num]);

				pointCoords.push([0, 0]);
				pointCoords.push([1, 0]);
				pointCoords.push([1, 1]);
				pointCoords.push([0, 1]);

				indices.push(count*4 + 3);
				indices.push(count*4 + 2);
				indices.push(count*4 + 0);
				indices.push(count*4 + 2);
				indices.push(count*4 + 1);
				indices.push(count*4 + 0);

				count ++;
			}
		}

		this.mesh = new alfrid.Mesh(GL.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
		this.mesh.bufferData(pointCoords, 'aPointCoord', 2);


		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("textureNext", "uniform1i", 1);
		this.shader.uniform("textureExtra", "uniform1i", 2);
	}


	render(texture, textureNext, textureExtra, percent) {
		this.shader.bind();
		texture.bind(0);
		textureNext.bind(1);
		textureExtra.bind(2);
		this.shader.uniform("percent", "uniform1f", percent);
		GL.draw(this.mesh);
	}


}

export default ViewPlanes;
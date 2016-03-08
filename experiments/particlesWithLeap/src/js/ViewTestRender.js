// ViewTestRender.js

import alfrid from './libs/alfrid.js';

var glslify = require("glslify");

let GL = alfrid.GL;

class ViewTestRender extends alfrid.View {

	constructor() {
		
		super(glslify('../shaders/testRender.vert'), glslify('../shaders/render.frag'));
		this.time = 0;

	}


	_init() {

		let positions     = [];
		let flipPositions = [];
		let coords        = [];
		let indices       = [0, 1, 2];


		let angler = Math.PI * 2 / 3.0;

		positions.push([Math.sin(angler*2 + Math.PI), Math.cos(angler*2 + Math.PI), 0]);
		positions.push([Math.sin(angler + Math.PI), Math.cos(angler + Math.PI), 0]);
		positions.push([Math.sin(angler*3 + Math.PI), Math.cos(angler*3 + Math.PI), 0]);

		flipPositions.push([Math.sin(angler*2), Math.cos(angler*2), 0]);
		flipPositions.push([Math.sin(angler), Math.cos(angler), 0]);
		flipPositions.push([Math.sin(angler*3), Math.cos(angler*3), 0]);

		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferData(flipPositions, 'aFlipPosition', 3);
		this.mesh.bufferIndices(indices);
	}


	render() {
		// this.time +=.5;
		if(this.time>=1) this.time = 0;
		else this.time = 1;

		this.shader.bind();

		this.shader.uniform("flipValue", "uniform1f", this.time);
		GL.draw(this.mesh);
	}


}

export default ViewTestRender;
// ViewSave.js

import alfrid from './libs/alfrid.js';

var glslify = require("glslify");

var random = function(min, max) { return min + Math.random() * (max - min);	}

let GL;

class ViewSave extends alfrid.View {
	constructor() {

		GL = alfrid.GL;

		super(glslify('../shaders/save.vert'), glslify('../shaders/save.frag') );

	}


	_init() {
		

		var positions = [];
		var coords = [];
		var indices = []; 
		var count = 0;

		var numParticles = params.numParticles;
		var totalParticles = numParticles * numParticles;
		var ux, uy;
		var range = 3.;

		for(var j=0; j<numParticles; j++) {
			for(var i=0; i<numParticles; i++) {
				positions.push([random(-range, range), random(-range, range), random(params.maxRange, -params.maxRange)]);

				ux = i/numParticles-1.0 + .5/numParticles;
				uy = j/numParticles-1.0 + .5/numParticles;
				coords.push([ux, uy]);
				indices.push(count);
				count ++;


				positions.push([Math.random(), Math.random(), Math.random()]);
				coords.push([ux, uy+1.0]);
				indices.push(count);
				count ++;

			}
		}


		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
	}


	render() {

		this.shader.bind();
		GL.draw(this.mesh);
		
	}

}


export default ViewSave;

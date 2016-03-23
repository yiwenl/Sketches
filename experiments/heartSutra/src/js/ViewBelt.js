// ViewBelt.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewBelt extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/belt.vert'), glslify('../shaders/planes.frag'));
	}


	_init() {
		let num         = params.numParticles;
		this.positions   = [];
		this.coords      = [];
		this.pointCoords = [];
		this.indices     = [];
		this.uv          = [];
		this.count       = 0;
		this.index       = 0;
		this.size        = 0.03;

		for(let j=0; j<num; j++) {
			for(let i=0; i<num; i++) {
				this._createRibbon();
			}
		}

		this.mesh = new alfrid.Mesh(GL.TRIANGLES);
		this.mesh.bufferVertex(this.positions);
		this.mesh.bufferTexCoords(this.coords);
		this.mesh.bufferIndices(this.indices);
		this.mesh.bufferData(this.uv, "aPositionUV", 3);
	}


	_createRibbon() {
		let num = params.numSeg;
		let size = 0.1;
		let ribbonSize = 0.1;
		let numParticle = params.numParticles;
		let ux = (this.index % numParticle) / numParticle;
		let uy = Math.floor(this.index/numParticle) / numParticle;

		for(var i=0; i<num; i++) {
			this.positions.push([i*size, -ribbonSize, 0]);
			this.positions.push([(i+1)*size, -ribbonSize, 0]);
			this.positions.push([(i+1)*size,  ribbonSize, 0]);
			this.positions.push([i*size,  ribbonSize, 0]);
		
			this.coords.push([i/num, 0]);
			this.coords.push([(i+1)/num, 0]);
			this.coords.push([(i+1)/num, 1]);
			this.coords.push([i/num, 1]);

			this.indices.push(this.count * 4 + 0);
			this.indices.push(this.count * 4 + 1);
			this.indices.push(this.count * 4 + 2);
			this.indices.push(this.count * 4 + 0);
			this.indices.push(this.count * 4 + 2);
			this.indices.push(this.count * 4 + 3);

			this.uv.push([ux, uy, i]);
			this.uv.push([ux, uy, i+1]);
			this.uv.push([ux, uy, i+1]);
			this.uv.push([ux, uy, i]);

			this.count++;
		}

		this.index ++;
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewBelt;
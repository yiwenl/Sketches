// ViewSave.js

import alfrid from 'alfrid';

const vsSave = require("../shaders/save.vert");
const fsSave = require("../shaders/save.frag");
const GL = alfrid.GL;
const random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewSave extends alfrid.View {
	
	constructor(mVertices) {
		super(vsSave, fsSave);
		this._vertices = mVertices;
		this._initMesh();
	}


	_initMesh() {
		const vertices = this._vertices;
		const RANGE = .025;

		let positions = [];
		let coords = [];
		let indices = []; 
		let extras = [];
		let lifes = [];
		let count = 0;

		let numParticles = params.numParticles;
		let totalParticles = numParticles * numParticles;
		let ux, uy;

		function getRandomPos() {
			let idx = Math.floor(Math.random() * vertices.length);
			let v = vertices[idx];
			v[0] += random(-RANGE, RANGE);
			v[1] += random(-RANGE, RANGE);
			v[2] += random(-RANGE, RANGE);

			return v;
		}


		for(let j=0; j<numParticles; j++) {
			for(let i=0; i<numParticles; i++) {
				positions.push(getRandomPos());

				ux = i/numParticles*2.0-1.0+.5/numParticles;
				uy = j/numParticles*2.0-1.0+.5/numParticles;

				extras.push([Math.random(), Math.random(), Math.random()]);
				lifes.push([Math.random(), random(0.005, 0.01) * 0.25, Math.random()]);
				coords.push([ux, uy]);
				indices.push(count);
				count ++;

			}
		}


		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);

		this.meshExtra = new alfrid.Mesh(GL.POINTS);
		this.meshExtra.bufferVertex(extras);
		this.meshExtra.bufferTexCoords(coords);
		this.meshExtra.bufferIndices(indices);

		this.meshLife = new alfrid.Mesh(GL.POINTS);
		this.meshLife.bufferVertex(lifes);
		this.meshLife.bufferTexCoords(coords);
		this.meshLife.bufferIndices(indices);
	}


	render(state=0) {
		this.shader.bind();
		if(state === 0) {
			GL.draw(this.mesh);	
		} else if(state === 1) {
			GL.draw(this.meshExtra);	
		} else if(state === 2) {
			GL.draw(this.meshLife);
		}
	}


}

export default ViewSave;
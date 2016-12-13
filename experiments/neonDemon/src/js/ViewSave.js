// ViewSave.js

import alfrid from 'alfrid';

const vsSave = require('../shaders/save.vert');
const fsSave = require('../shaders/save.frag');
const GL = alfrid.GL;
const random = function (min, max) { return min + Math.random() * (max - min);	};

class ViewSave extends alfrid.View {
	
	constructor() {
		super(vsSave, fsSave);
	}


	_init() {
		

	}


	save() {
		let positions = [];
		let coords = [];
		let indices = []; 
		let extras = [];
		let uvs = [];
		let count = 0;

		let numParticles = params.numParticles;
		let totalParticles = numParticles * numParticles;
		console.debug('Total Particles : ', totalParticles);
		let ux, uy;
		let range = 3;

		function getPosition(i, j) {
			return [
				i/numParticles * range - range * .5,
				j/numParticles * range - range * .5,
				0
			]
		}

		const margin = .15;
		const total = 1.0 - margin * 2.0;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				// positions.push([random(-range, range), random(-range, range), random(-range, range)]);
				positions.push(getPosition(i, j));

				ux = i / numParticles * 2.0 - 1.0 + .5 / numParticles;
				uy = j / numParticles * 2.0 - 1.0 + .5 / numParticles;

				extras.push([Math.random(), Math.random(), Math.random()]);
				coords.push([ux, uy]);
				uvs.push([i/numParticles * total + margin, j/numParticles * total + margin]);
				indices.push(count);
				count ++;

			}
		}


		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferData(extras, 'aExtra', 3);
		this.mesh.bufferData(uvs, 'aUV', 2);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);
	}


	render(texture, textureDepth, invertView, invertProjection, camPos) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureDepth", "uniform1i", 1);
		textureDepth.bind(1);

		this.shader.uniform('invertView', 'mat4', invertView);
		this.shader.uniform('invertProjection', 'mat4', invertProjection);

		this.shader.uniform("uCamPos", "vec3", camPos);

		GL.draw(this.mesh);
	}


}

export default ViewSave;
// ViewSave.js

import alfrid from 'alfrid';

const vsSave = require('../shaders/save.vert');
const fsSave = require('../shaders/save.frag');
const GL = alfrid.GL;
const random = function (min, max) { return min + Math.random() * (max - min);	};
let numSkip = 0;

class ViewSave extends alfrid.View {
	
	constructor() {
		super(vsSave, fsSave);
	}


	_init() {
	}


	_checkPosition(i, j) {
		const { numParticles } = params;
		let ti = i;
		let tj = j;
		let index = (Math.floor(ti) + Math.floor(tj) * params.numParticles) * 4;
		if(this._imgData[index + 3] < 10) return true;

		let r = this._imgData[index];
		let g = this._imgData[index+1];
		return r + g < 150;
	}


	_getRandomPos() {
		const { numParticles } = params;
		let i, j, count = 0;
		const margin = 0.15;
		let range = 3;
		const total = 1.0 - margin * 2;

		do {
			i = (Math.random() * total + margin) * numParticles;
			j = (Math.random() * total + margin) * numParticles;

			if(count++ > 400) {
				// console.log('too many tries');
				numSkip++;
				break;
			}
		} while(this._checkPosition(i, j));

		let rr = 1;
		i += random(-rr, rr);
		j += random(-rr, rr);

		let x = i/numParticles * range - range/2;
		let y = j/numParticles * range - range/2;
		return {
			i,
			j,
			pos:[x, y, 0]
		}
	}


	save(mImgData) {
		this._imgData = mImgData;
		let positions = [];
		let coords = [];
		let indices = []; 
		let extras = [];
		let uvs = [];
		let count = 0;

		let numParticles = params.numParticles;
		let totalParticles = numParticles * numParticles;
		console.debug('Total Particles : ', totalParticles);
		let ux, uy, mx, my;
		let range = 3;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				// positions.push([random(-range, range), random(-range, range), random(-range, range)]);
				// positions.push(getPosition(i, j));
				const o = this._getRandomPos();
				positions.push(o.pos);
				

				ux = i / numParticles * 2.0 - 1.0 + .5 / numParticles;
				uy = j / numParticles * 2.0 - 1.0 + .5 / numParticles;

				mx = o.i/numParticles;
				my = o.j/numParticles;

				extras.push([Math.random(), Math.random(), Math.random()]);
				coords.push([ux, uy]);
				// uvs.push([i/numParticles * total + margin, j/numParticles * total + margin]);
				uvs.push([mx, my]);
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
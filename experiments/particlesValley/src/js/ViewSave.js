// ViewSave.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/save.vert';
import fs from '../shaders/save.frag';

const random = function (min, max) { return min + Math.random() * (max - min);	};
const NUM = 200;
class ViewSave extends alfrid.View {
	
	constructor(viewDots) {
		super(vs, fs);
		this._vDots = viewDots;
		this._initMesh();
	}


	_initMesh() {
		const vDots = this._vDots;
		const img = getAsset('map');
		console.log(img.width, img.height);
		const canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		const pixels = ctx.getImageData(0, 0, img.width, img.height).data;
		const totalSize = NUM * vDots.scale * 8;
		const points = [];
		const MIN_HEIGHT = 120;
		let r, index, x, y, z;


		for(let i=0; i<pixels.length; i+=4) {
			r = pixels[i];
			if(r > MIN_HEIGHT) {
				index = i/4;
				z = Math.floor(index / img.width);
				x = index % img.width;
				y = r / 255 * vDots.maxHeight + vDots.noiseHeight * .5;

				x /= img.width;
				z /= img.height;
				z = 1.0 - z;

				x = x * totalSize - totalSize / 2;
				z = (z * totalSize - totalSize / 2) * 2;

				points.push([x, y, z]);
			}			
		}

		function getRandomPos() {
			return points[Math.floor(Math.random() * points.length)];
		}


		let positions = [];
		let coords = [];
		let indices = []; 
		let extras = [];
		let count = 0;

		let numParticles = params.numParticles;
		let totalParticles = numParticles * numParticles;
		// console.debug('Total Particles : ', totalParticles);
		let ux, uy;
		let range = 8;

		for(let j = 0; j < numParticles; j++) {
			for(let i = 0; i < numParticles; i++) {
				// positions.push([random(-range, range), random(0, range), random(-range, range)]);
				positions.push(getRandomPos());

				ux = i / numParticles * 2.0 - 1.0 + .5 / numParticles;
				uy = j / numParticles * 2.0 - 1.0 + .5 / numParticles;

				extras.push([Math.random(), Math.random(), Math.random()]);
				coords.push([ux, uy]);
				indices.push(count);
				count ++;

			}
		}


		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);

		this.meshExtra = new alfrid.Mesh(GL.POINTS);
		this.meshExtra.bufferVertex(extras);
		this.meshExtra.bufferTexCoord(coords);
		this.meshExtra.bufferIndex(indices);
	}


	render(state = 0) {
		this.shader.bind();
		if(state === 0) {
			GL.draw(this.mesh);	
		} else if(state === 1) {
			GL.draw(this.meshExtra);
		}
	}


}

export default ViewSave;
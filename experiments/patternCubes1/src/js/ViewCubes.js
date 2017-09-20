// ViewCubes.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cubes.vert';
import fs from 'shaders/cubes.frag';

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.cube(1, 1, 1);

		const numX = 14;
		const numY = 12;
		const positions = [];
		const uvIndices = [];
		const direction = [];
		const extra = [];
		const total = numX + numY;

		for(let i=0; i<6; i++) {
			let index = 0;
			let a = 0;
			if(i == 1) {
				index = 1;
				a = Math.PI/2;
			}

			if(i == 0) {
				index = 1;
				a = -Math.PI/2;
			}

			if(i == 5) {
				a = Math.PI/2;
			}

			uvIndices.push([index, i, a]);
			uvIndices.push([index, i, a]);
			uvIndices.push([index, i, a]);
			uvIndices.push([index, i, a]);
		}


		function getRotateDirection() {
			const t = Math.random() * 3;

			// return [1, 0, 0];


			if(t < 1) {
				return [1, 0, 0]
			} else if (t < 2) {
				return [0, 1, 0];
			} else if (t < 3) {
				return [0, 0, 1];
			} else if (t < 4) {
				return [-1, 0, 0];
			} else if (t < 5) {
				return [0, -1, 0];
			} else {
				return [0, 0, -1];
			} 
		}

		function getPos(i, j) {

			let x = -numX/2 + i;
			let y = -numY/2 + j;
			let z = -(-total/2 + i + j);

			return [x, y, z];
		}


		function getExtra() {
			let x = Math.floor(Math.random() * 4) * Math.PI/2;
			let y = Math.random();
			return [x, y];
		}

		for(let i=0; i<numX; i++) {
			for(let j=0; j<numY; j++) {
				positions.push(getPos(i, j));
				direction.push(getRotateDirection());
				extra.push(getExtra());
			}
		}

		this.mesh.bufferData(uvIndices, 'aUVIndex');
		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(direction, 'aDirection');
		this.mesh.bufferInstance(extra, 'aExtra');
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewCubes;
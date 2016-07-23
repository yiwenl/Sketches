// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/depth.vert';
import fs from '../shaders/depth.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const offset = .16;

		let positions = [];
		let coords = [];
		let indices = []; 
		let count = 0;
		let numSeg = 50;
		let size = 40;


		function leng(x, y) {
			return Math.sqrt(x*x + y*y);
		}

		function getPos(i, j, y = 0) {
			let x = (i/numSeg-.5) * size;
			let z = (j/numSeg-.5) * size;
			let p = leng(x, z) / size;
			if(p > 1) p = 1;
			p = 1.0 - p;
			// p = Math.cos(p * Math.PI * 2.0);

			let n = Perlin.noise(x*offset, 0, z*offset) * p;

			return [x, y+n*2.20, z];
		}

		let y = -3;

		for(let j=0; j<numSeg; j++) {
			for(let i=0; i<numSeg; i++) {
				positions.push( getPos(i, j+1, y));
				positions.push( getPos(i+1, j+1, y));
				positions.push( getPos(i+1, j, y));
				positions.push( getPos(i, j, y));

				coords.push([0, 0]);
				coords.push([1, 0]);
				coords.push([1, 1]);
				coords.push([0, 1]);

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);

				count ++;
			}
		}

		this.mesh = new alfrid.Mesh(GL.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);

		this.shader.bind();
		this.shader.uniform("color", "uniform3fv", [1, 1, 1]);
		this.shader.uniform("opacity", "uniform1f", 1);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
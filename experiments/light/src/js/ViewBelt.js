// ViewBelt.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/belt.vert';
import fs from '../shaders/belt.frag';

class ViewBelt extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {

		const yz = 1.5;
		const width = 250;

		const positions = [];
		const uvs = [];
		const indices = [];
		const num = 24;
		let count = 0;

		const getPos = (i, j) => {
			let x = -width/2 + i * width;
			let a = j/num * Math.PI * 2;
			let y = Math.sin(a) * yz;
			let z = Math.cos(a) * yz;

			return [x, y, z];
		}

		for(let i = 0; i<num; i++) {
			positions.push(getPos(0, i));
			positions.push(getPos(1, i));
			positions.push(getPos(1, i+1));
			positions.push(getPos(0, i+1));

			uvs.push([0, i/num]);
			uvs.push([1, i/num]);
			uvs.push([1, (i+1)/num]);
			uvs.push([0, (i+1)/num]);

			indices.push(count * 4 + 0);
			indices.push(count * 4 + 1);
			indices.push(count * 4 + 2);
			indices.push(count * 4 + 0);
			indices.push(count * 4 + 2);
			indices.push(count * 4 + 3);

			count ++;
		}

		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewBelt;
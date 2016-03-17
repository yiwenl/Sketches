// ViewMountain.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
let glslify = require("glslify");

class ViewMountain extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/pbrMountain.vert'), glslify('../shaders/pbr.frag'));
	}


	_init() {
		let positions = [];
		let coords = [];
		let indices = []; 

		let index = 0;
		let size = 300;
		let numSeg = 100;
		let u, v;
		let uvGap = 1/numSeg;
		let sx = - size * .5;


		let getPosition = function(x, y) {
			let px = x/numSeg;
			let pz = y/numSeg;

			tx = sx + px * size;
			ty = -0;
			tz = sx +  pz * size;

			return[tx, ty, tz];
		}

		for(let j=0; j<numSeg; j++) {
			for(let i=0; i<numSeg; i++) {
				positions.push(getPosition(i, j+1));
				positions.push(getPosition(i+1, j+1));
				positions.push(getPosition(i+1, j));
				positions.push(getPosition(i, j));

				u = i/numSeg;
				v = j/numSeg;

				coords.push([u, v+uvGap]);
				coords.push([u+uvGap, v+uvGap]);
				coords.push([u+uvGap, v]);
				coords.push([u, v]);

				indices.push(index*4 + 0);
				indices.push(index*4 + 1);
				indices.push(index*4 + 2);
				indices.push(index*4 + 0);
				indices.push(index*4 + 2);
				indices.push(index*4 + 3);

				index++;
			}
		}

		this.mesh = new bongiovi.Mesh(GL.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewMountain;
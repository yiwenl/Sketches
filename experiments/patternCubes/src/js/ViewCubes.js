// ViewCubes.js


import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cubes.vert';
import fs from 'shaders/cubes.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = 1;
		this.mesh = alfrid.Geom.cube(s, s, s);

		const numCubes = 100;
		const numX = 10;
		const numY = 14;
		const posOffset = [];
		const extra = [];
		const range = 4;
		const { floor } = Math;

		function getPos(i, j) {
			let x = -numX/2 + i;
			let y = -numY/2 + j;
			let z = random(-1, 2);
			x = floor(x / s) * s;
			y = floor(y / s) * s;
			z = floor(z / s) * s;

			return [x, y, z];
		}

		for(let i=0; i<numX; i++) {
			for(let j=0; j<numY; j++) {
				posOffset.push(getPos(i, j));


				let a = Math.floor(Math.random() * 4) * Math.PI/2;
				let index = Math.floor(Math.random() * 16);
				let u = index % 4 * 0.25;
				let v = Math.floor(index/4) * 0.25;

				extra.push([u, v, a]);
			}
		}

		this.mesh.bufferInstance(posOffset, 'aPosOffset');
		this.mesh.bufferInstance(extra, 'aExtra');
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("num", "float", 4);
		GL.draw(this.mesh);
	}


}

export default ViewCubes;
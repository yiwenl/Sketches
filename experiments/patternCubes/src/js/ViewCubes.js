// ViewCubes.js


import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cubes.vert';
import fs from 'shaders/cubes.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random() * 0xff;
	}


	_init() {
		const s = 1;
		this.mesh = alfrid.Geom.cube(s, s, s);

		const numCubes = 40;
		const numX = 8;
		const numY = 11;
		const posOffset = [];
		const extra = [];
		const direction = [];
		const range = 4;
		const { floor, abs } = Math;
		const uvIndices = [];


		for(let i=0; i<6; i++) {
			uvIndices.push([i, i, i]);
			uvIndices.push([i, i, i]);
			uvIndices.push([i, i, i]);
			uvIndices.push([i, i, i]);
		}


		function getPos(i, j) {
			let x = -numX/2 + i;
			let y = -numY/2 + j;
			let z = random(-1, 2);
			x = floor(x / s) * s;
			y = floor(y / s) * s;
			z = floor(z / s) * s;

			return [x, y, z];
		}


		function getExtra() {
			let a = Math.floor(Math.random() * 4) * Math.PI/2;
			let index = Math.floor(Math.random() * 16);

			return [index, a, Math.random() * 0xFF];
		}


		function getRotateDirection() {
			const t = Math.random() * 3;
			if(t < 1) {
				return [1, 0, 0]
			} else if (t < 2) {
				return [0, 1, 0];
			} else {
				return [0, 0, 1];
			}
		}

		for(let i=0; i<numX; i++) {
			for(let j=0; j<numY; j++) {
				posOffset.push(getPos(i, j));
				extra.push(getExtra());
				direction.push(getRotateDirection());
			}
		}

		function checkPos(x, y, z) {
			let overlapped = false;
			posOffset.forEach(p => {
				if(abs(p[0]-x) < .1 && abs(p[1]-y) < .1 && abs(p[2]-z) < .1 ) {
					overlapped = true;
				}
			});

			return overlapped;
		}


		function getRadomPos() {
			let x, y, z;
			do {
				x = floor(random(0, 25)/2);
				y = floor(random(0, 20)/2);
				z = floor(random(-1, 2));
				if(Math.random() > .5) x *= -1;
				if(Math.random() > .5) y *= -1;	
			} while( abs(x) < numX/2 && abs(y) < numY/2 || checkPos(x,y,z));
			

			return [x, y, z];
		}


		//	out landers 
		for(let i=0; i<numCubes; i++) {
			posOffset.push(getRadomPos());
			extra.push(getExtra());
			direction.push(getRotateDirection());
		}

		this.mesh.bufferData(uvIndices, 'aUVIndex');
		this.mesh.bufferInstance(posOffset, 'aPosOffset');
		this.mesh.bufferInstance(extra, 'aExtra');
		this.mesh.bufferInstance(direction, 'aDirection');
	}


	render(texture) {
		this.time += 0.002;
		this.shader.bind();
		this.shader.uniform("num", "float", 4);
		this.shader.uniform("time", "float", this.time);
		GL.draw(this.mesh);
	}


}

export default ViewCubes;
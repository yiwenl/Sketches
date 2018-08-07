// ViewWires.js


import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/wires.vert';

var random = function(min, max) { return min + Math.random() * (max - min);	}
const _lerp = (a, b, p) => {
	return a + (b - a) * p;
}

const lerp = (a, b, p) => {
	return [
		_lerp(a[0], b[0], p),
		_lerp(a[1], b[1], p),
		_lerp(a[2], b[2], p)
	];
}


const getDist = (num) => {
	let a = [0];
	let i = num;
	let total = 0;
	let sum = 0;
	while(i--) {
		// let v = random(.1, 1);
		let v = 1;
		a.push(v + sum);
		sum += v;
		total += v;
	}

	a = a.map( v=>v/total);

	// console.log(a);
	return a;
}

class ViewWires extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);

		this.shader.bind();

		// this.shader.uniform("color", "vec3", [25/255, 52/255, 65/255]);
		this.shader.uniform("color", "vec3", [252/255, 255/255, 245/255]);
		// this.shader.uniform("color", "vec3", [145/255, 170/255, 157/255]);
		this.shader.uniform("opacity", "float", 0.5);
	}


	_init() {
		const { numWires, numSeg } = Config;
		let count = numWires;

		const positions = [];
		const normals = [];
		const uvs = [];
		const indices = [];
		let index = 0;
		let r1 = 1;
		let r2 = 2;
		let d = 5;
		let r = 0.01;

		this.points = [];


		const getPos = (x, r) => {
			let t = 0;
			return [x + random(-t, t), random(-r, r), random(-r, r)];
		}

		while(count--) {
			let a = getPos(-d, r1);
			let b = getPos(d, r2);

			this.points.push([a, b]);

			const t = getDist(numSeg);

			for(let i=0; i<numSeg; i++) {
				// let p0 = lerp(a, b, i/numSeg);
				// let p1 = lerp(a, b, (i+1)/numSeg);

				positions.push(a);
				positions.push(a);

				normals.push(b);
				normals.push(b);

				uvs.push([t[i], 0]);
				uvs.push([t[i+1], 0]);

				indices.push(index);
				indices.push(index+1);

				index += 2;
			}
		}

		this.mesh = new alfrid.Mesh(GL.LINES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);
	}


	render(mCtrl0, mCtrl1) {
		this.shader.bind();
		this.shader.uniform("uControl0", "vec3", mCtrl0);
		this.shader.uniform("uControl1", "vec3", mCtrl1);
		GL.draw(this.mesh);
	}


}

export default ViewWires;
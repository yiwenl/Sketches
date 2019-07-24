// ViewTest.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/test.vert';
import fs from 'shaders/test.frag';

class ViewTest extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const radius = 1;

		let m = mat4.create();
		this._points = [];
		for(let i=0; i< 3; i++) {
			let angle = Math.PI * 2 / 3 * i + Math.PI/2;
			let v = vec3.fromValues(radius, 0, 0);
			mat4.identity(m, m);
			mat4.rotateZ(m, m, angle);
			vec3.transformMat4(v, v, m);

			this._points.push(v);
		}


		const positions = [];
		const normals = [];
		const next = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const getNextIndex = (i) => {
			if(i === 2) {
				return 0;
			} else {
				return i + 1;
			}
		}

		for(let i=0; i<3; i++) {

			positions.push([0, 0, 0]);
			positions.push(this._points[i]);
			positions.push(this._points[getNextIndex(i)]);

			uvs.push([1, 0]);
			uvs.push([0, 1]);
			uvs.push([0, 1]);

			indices.push(count);
			indices.push(count+1);
			indices.push(count+2);

			normals.push(this._points[i]);
			normals.push(this._points[i]);
			normals.push(this._points[i]);

			next.push(this._points[getNextIndex(i)])
			next.push(this._points[getNextIndex(i)])
			next.push(this._points[getNextIndex(i)])

			count += 3;
		}


		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferData(next, 'aNext');
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

		this._bBall = new alfrid.BatchBall();

		this.offset = new alfrid.EaseNumber(0.1, 0.05);
		setTimeout(()=> {
			gui.add(this.offset, 'value', 0, 1);
		}, 500);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uOffset", "float", this.offset.value);
		GL.draw(this.mesh);
		let s = .02;

		this._points.forEach( p => {
			this._bBall.draw(p, [s, s, s], [1, 0, 0]);
		})
	}


}

export default ViewTest;
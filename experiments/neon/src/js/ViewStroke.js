// ViewStroke.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/stroke.frag';

class ViewStroke extends alfrid.View {
	
	constructor() {
		super(null, fs);
		this._points = [];

		this.mtxLeft = mat4.create();
		mat4.rotateY(this.mtxLeft, this.mtxLeft, -Math.PI/2);
		this.mtxRight = mat4.create();
		mat4.rotateY(this.mtxRight, this.mtxRight,  Math.PI/2);
	}


	_init() {
		this.mesh;
	}


	clear() {
		this._points = [];
		this.mesh = null;
	}


	updateStroke(points, cameraPos) {
		const axis = vec3.clone(cameraPos);
		vec3.normalize(axis, axis);
		mat4.identity(this.mtxLeft);
		mat4.identity(this.mtxRight);
		mat4.fromRotation(this.mtxLeft, -Math.PI/2, axis);
		mat4.fromRotation(this.mtxRight, Math.PI/2, axis);
		this.bias = vec3.clone(axis);
		vec3.scale(this.bias, this.bias, 0.005);

		let pCurrent, pNext;
		let dir = vec3.create();
		let width = .15;


		this._points = [];
		let meshPoints = points.map( (p, i) => {
			if(i === points.length - 1) {
				pCurrent = points[i-2];
				pNext = p;
			} else {
				pCurrent = p;
				pNext = points[i+1];
			}

			dir = vec3.sub(dir, pNext, pCurrent);
			vec3.normalize(dir, dir);

			let vLeft = vec3.clone(dir);
			vec3.scale(vLeft, vLeft, width);
			vec3.transformMat4(vLeft, vLeft, this.mtxLeft);
			vec3.add(vLeft, vLeft, p);
			vLeft[0] += this.bias[0] * i;
			vLeft[1] += this.bias[1] * i;
			vLeft[2] += this.bias[2] * i;

			let vRight = vec3.clone(dir);
			vec3.scale(vRight, vRight, width);
			vec3.transformMat4(vRight, vRight, this.mtxRight);
			vec3.add(vRight, vRight, p);
			vRight[0] += this.bias[0] * i;
			vRight[1] += this.bias[1] * i;
			vRight[2] += this.bias[2] * i;

			let pp = vec3.clone(p);
			pp[0] += this.bias[0] * i;
			pp[1] += this.bias[1] * i;
			pp[2] += this.bias[2] * i;


			this._points.push(vLeft);
			this._points.push(vRight);

			return {left:vLeft, right:vRight, center:pp};
		});

		this.updateMesh(meshPoints);
	}


	updateMesh(segs) {
		const positions = [];
		const coords = [];
		const indices = [];
		const normals = [];
		let count = 0;
		const num = segs.length-1;


		function addQuad(i, isLeft) {
			let v0, v1, v2, v3;
			if(isLeft) {
				v1 = segs[i+1].left;
				v2 = segs[i+1].center;
				v3 = segs[i].center;
				v0 = segs[i].left;

				coords.push([i/num, 0]);
				coords.push([(i+1)/num, 0]);
				coords.push([(i+1)/num, .5]);
				coords.push([i/num, .5]);
			} else {
				v1 = segs[i+1].center;
				v2 = segs[i+1].right;
				v3 = segs[i].right;
				v0 = segs[i].center;

				coords.push([i/num, .5]);
				coords.push([(i+1)/num, .5]);
				coords.push([(i+1)/num, 1]);
				coords.push([i/num, 1]);
			}

			positions.push(v0);
			positions.push(v1);
			positions.push(v2);
			positions.push(v3);

			normals.push([0, 1, 0]);
			normals.push([0, 1, 0]);
			normals.push([0, 1, 0]);
			normals.push([0, 1, 0]);


			indices.push(count * 4 + 0);
			indices.push(count * 4 + 1);
			indices.push(count * 4 + 2);
			indices.push(count * 4 + 0);
			indices.push(count * 4 + 2);
			indices.push(count * 4 + 3);
			count ++;
		}


		for(let i=0; i<segs.length -2; i++) {
			addQuad(i, true);
			addQuad(i, false);
		}

		this.mesh = null;
		this.mesh = new alfrid.Mesh(GL.TRIANGLES);

		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);
	}


	render(texture) {
		if(!this.mesh) {
			return;
		}
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


	get points() {
		return this._points;
	}

}

export default ViewStroke;
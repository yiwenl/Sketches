// ViewStroke.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/pbr.vert';
import fs from '../shaders/stroke.frag';

class ViewStroke extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this._points = [];

		this.mtxLeft = mat4.create();
		mat4.rotateY(this.mtxLeft, this.mtxLeft, -Math.PI/2);
		this.mtxRight = mat4.create();
		mat4.rotateY(this.mtxRight, this.mtxRight,  Math.PI/2);
	}


	_init() {
		this.mesh;

		this.roughness = .9;
		this.specular = 0.5;
		this.metallic = 0.5;
		this.baseColor = [1, 1, 1];
	}


	clear() {
		this._points = [];
		this.mesh = null;
	}


	updateStroke(points) {

		let pCurrent, pNext;
		let dir = vec3.create();
		let width = .35;

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

			let vRight = vec3.clone(dir);
			vec3.scale(vRight, vRight, width);
			vec3.transformMat4(vRight, vRight, this.mtxRight);
			vec3.add(vRight, vRight, p);


			this._points.push(vLeft);
			this._points.push(vRight);

			return {left:vLeft, right:vRight, center:p};
		});

		this.updateMesh(meshPoints);
	}


	updateMesh(segs) {
		const positions = [];
		const coords = [];
		const indices = [];
		const normals = [];
		let count = 0;
		const num = segs.length;


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

		// if(!this.mesh) {
			
		// }
		this.mesh = null;
		this.mesh = new alfrid.Mesh(GL.TRIANGLES);

		this.mesh.bufferVertex(positions, true);
		this.mesh.bufferTexCoord(coords, true);
		this.mesh.bufferNormal(normals, true);
		this.mesh.bufferIndex(indices, true);
	}


	render(textureRad, textureIrr, textureColor) {
		if(!this.mesh) {
			return;
		}
		this.shader.bind();
		this.shader.uniform('uColorMap', 'uniform1i', 0);
		this.shader.uniform('uRadianceMap', 'uniform1i', 1);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		textureColor.bind(0);
		textureRad.bind(1);
		textureIrr.bind(2);

		this.shader.uniform('uBaseColor', 'uniform3fv', [1, 1, 1]);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);
		GL.draw(this.mesh);
	}


	get points() {
		return this._points;
	}

}

export default ViewStroke;
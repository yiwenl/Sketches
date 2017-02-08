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

		this._opacity = new alfrid.EaseNumber(1);
	}


	_init() {
		this.mesh;

		this.roughness = 1;
		this.specular = 1;
		this.metallic = 0;

		const grey = 1.;
		this.baseColor = [grey, grey, grey];

		// const f = gui.addFolder('Stroke');
		// f.add(this, 'roughness', 0, 1);
		// f.add(this, 'specular', 0, 1);
		// f.add(this, 'metallic', 0, 1);
		// f.open();
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

		this.mesh = null;
		this.mesh = new alfrid.Mesh(GL.TRIANGLES);

		this.mesh.bufferVertex(positions, true);
		this.mesh.bufferTexCoord(coords, true);
		this.mesh.bufferNormal(normals, true);
		this.mesh.bufferIndex(indices, true);
	}

	show() {
		this._opacity.value = 1;
	}

	anim() {
		this._opacity.setTo(1);
		this._opacity.value = 0;
	}


	render(texture, textureNormal, textureRad, textureIrr) {
		if(!this.mesh) {
			return;
		}
		this.shader.bind();
		this.shader.uniform("uColorMap", "uniform1i", 0);
		this.shader.uniform("uNormalMap", "uniform1i", 1);
		textureNormal.bind(1);
		texture.bind(0);

		this.shader.uniform('uRadianceMap', 'uniform1i', 2);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 3);
		textureRad.bind(2);
		textureIrr.bind(3);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform("uScale", "vec3", [1, 1, 1]);
		this.shader.uniform("uPosition", "vec3", [0, 0, 0]);
		this.shader.uniform("uRotation", "float", 0);


		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);
		this.shader.uniform("uOpacity", "float", this._opacity.value);

		GL.draw(this.mesh);
	}


	get points() {
		return this._points;
	}

}

export default ViewStroke;
// ViewSphere.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/spikes.vert';
import fs from '../shaders/pbr.frag';

class ViewSphere extends alfrid.View {
	
	constructor() {
		let _vs = vs.replace('${NUM}', params.numTouches);
		super(_vs, fs);
	}


	_init() {
		let strObj = getAsset('objModel');
		const mesh = alfrid.ObjLoader.parse(strObj);
		const vertices = mesh.vertices;

		const positions = [];
		const rotations = [];
		const centers = [];
		const coords = [];
		const indices = [];
		const normals = [];
		const ba = vec3.create();
		const ca = vec3.create();
		let count = 0;
		const spikeSize = 1;
		const NUM_LAYERS = 5;
		const THETA = -0.5;

		function getCenter(a, b, c) {
			return [
				(a[0] + b[0] + c[0])/3 * spikeSize,
				(a[1] + b[1] + c[1])/3 * spikeSize,
				(a[2] + b[2] + c[2])/3 * spikeSize,
			];
		}

		function getCenterOnLine(a, b) {
			return [
				(a[0] + b[0])/2,
				(a[1] + b[1])/2,
				(a[2] + b[2])/2,
			]	
		}

		function getNormal(a, b, c) {
			const n = vec3.create();
			vec3.sub(ba, b, a);
			vec3.sub(ca, c, a);
			vec3.cross(n, ba, ca);
			vec3.normalize(n, n);
			return n;
		}

		function subVec(a, b) {
			return [
				a[0] - b[0],
				a[1] - b[1],
				a[2] - b[2],
			]
		}


		function addTriangle(a, b, c, rotation) {
			const n = getNormal(c, a, b);
			const center = getCenterOnLine(a, b);
			const axis = vec3.create();
			vec3.sub(axis, b, a);
			vec3.normalize(axis, axis);

			positions.push(subVec(a, center));
			positions.push(subVec(b, center));
			positions.push(subVec(c, center));

			centers.push(center);
			centers.push(center);
			centers.push(center);

			rotations.push([axis[0], axis[1], axis[2], rotation]);
			rotations.push([axis[0], axis[1], axis[2], rotation]);
			rotations.push([axis[0], axis[1], axis[2], rotation]);

			coords.push([0, 0]);
			coords.push([0, 0]);
			coords.push([0, 0]);

			normals.push(n);
			normals.push(n);
			normals.push(n);

			indices.push(count * 3);
			indices.push(count * 3 + 1);
			indices.push(count * 3 + 2);

			count ++;
		}

		for (let i=0; i<vertices.length; i+=3) {
			const a = vertices[i];
			const b = vertices[i+1];
			const c = vertices[i+2];
			let angle = 0;

			const center = getCenter(a, b, c);

			for(let i=0; i<NUM_LAYERS; i++) {
				angle = i * THETA;
				addTriangle(a, b, center, angle);
				addTriangle(b, c, center, angle);
				addTriangle(c, a, center, angle);	
			}
			
		}



		this.roughness = .95;
		this.specular = 0.0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];

		// this.mesh = mesh;
		this.meshSphere = mesh;
		this.mesh = new alfrid.Mesh(GL.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferIndex(indices);
		this.mesh.bufferData(centers, 'aCenter', 3);
		this.mesh.bufferData(rotations, 'aRotation', 4);
	}


	render(textureRad, textureIrr, touches, touchForces) {
		if(!this.mesh) {
			return;
		}

		const uniformArray = [];

		// console.log(touches.length);

		for(let i=0; i<params.numTouches; i++) {
			if(touches[i]) {
				uniformArray.push(touches[i][0]);
				uniformArray.push(touches[i][1]);
				uniformArray.push(touches[i][2]);
				uniformArray.push(touchForces[i].value);	
			} else {
				uniformArray.push(0);
				uniformArray.push(0);
				uniformArray.push(0);
				uniformArray.push(0);
			}
			
		}


		this.shader.bind();

		this.shader.uniform('uRadianceMap', 'uniform1i', 0);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 1);
		textureRad.bind(0);
		textureIrr.bind(1);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		// this.shader.uniform('uTouch', 'vec3', hit);
		this.shader.uniform('uTouches', 'vec4', uniformArray);
		this.shader.uniform('uTouchRadius', 'float', params.touchRadius);


		this.shader.uniform('uOffset', 'float', params.offset);

		GL.draw(this.mesh);
	}

}

export default ViewSphere;
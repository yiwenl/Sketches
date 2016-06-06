// ViewSphere.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/spikes.vert';
import fs from '../shaders/pbr.frag';

class ViewSphere extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		let strObj = getAsset('objModel');
		const mesh = alfrid.ObjLoader.parse(strObj);
		const vertices = mesh.vertices;

		const positions = [];
		const centers = [];
		const coords = [];
		const indices = [];
		const normals = [];
		const ba = vec3.create();
		const ca = vec3.create();
		let count = 0;
		const spikeSize = 1.2;

		function getCenter(a, b, c) {
			return [
				(a[0] + b[0] + c[0])/3 * spikeSize,
				(a[1] + b[1] + c[1])/3 * spikeSize,
				(a[2] + b[2] + c[2])/3 * spikeSize,
			];
		}

		function getNormal(a, b, c) {
			const n = vec3.create();
			vec3.sub(ba, b, a);
			vec3.sub(ca, c, a);
			vec3.cross(n, ba, ca);
			vec3.normalize(n, n);
			return n;
		}


		function addTriangle(a, b, c) {
			const n = getNormal(c, a, b);

			positions.push(a);
			positions.push(b);
			positions.push(c);

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

			const center = getCenter(a, b, c);
			addTriangle(a, b, center);
			addTriangle(b, c, center);
			addTriangle(c, a, center);1
		}



		this.roughness = .95;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];

		// this.mesh = mesh;
		this.meshSphere = mesh;
		this.mesh = new alfrid.Mesh(GL.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferIndex(indices);
	}


	render(textureRad, textureIrr) {
		if(!this.mesh) {
			return;
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

		this.shader.uniform('uOffset', 'float', params.offset);

		GL.draw(this.mesh);
	}

}

export default ViewSphere;
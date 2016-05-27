// ViewDisks.js

import alfrid, { GL } from 'alfrid';

const vs = require('../shaders/disks.vert');
const fs = require('../shaders/pbr.frag');

class ViewDisks extends alfrid.View {
	
	constructor(mRadius = 5) {
		super(vs, fs);
		this._radius = mRadius;
		this._initMesh();
		this.time = Math.random() * 0xFF;
	}


	_initMesh() {
		let strObj = getAsset('objDisk');
		const meshDisk = alfrid.ObjLoader.parse(strObj);
		const diskVertices = meshDisk.vertices;
		const diskNormals = meshDisk.normals;
		const diskIndices = meshDisk._indices;
		const indexCount = diskIndices.length;

		const NUM = 16;
		const R = this._radius;
		const positions = [];
		const posOffsets = [];
		const coords = [];
		const indices = [];
		const normals = [];
		let count = 0;

		function getPosition(i, j) {
			let rx = j/(NUM/2) * Math.PI - Math.PI/2;
			console.log((R-5)*0.05);
			let ry = i/NUM * Math.PI * 2.0 + R * 0.05;

			const y = Math.sin(rx) * R;
			const r = Math.cos(rx) * R;
			const x = Math.cos(ry) * r;
			const z = Math.sin(ry) * r;

			return [x, y, z];
		}

		for (let j=1; j<NUM/2; j++) {
			for (let i=0; i<NUM; i++) {
				const center = getPosition(i, j);

				for (let k=0; k<diskVertices.length; k++) {
					positions.push(diskVertices[k]);
					coords.push(diskNormals[k]);
					normals.push(diskNormals[k]);
					posOffsets.push(center);
				}

				for( let k=0; k<diskIndices.length; k++) {
					indices.push(count * indexCount + diskIndices[k]);
				}

				count ++;
			}
		}



		this.mesh = new alfrid.Mesh(GL.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferData(posOffsets, 'aPosOffset', 3);

		this.roughness = .9;
		this.specular = .0;
		this.metallic = .0;
		this.baseColor = [1, 1, 1];

	}


	render(textureRad, textureIrr, textureAO) {
		let shader = this.shader;
		this.time += 1.5;
		shader.bind();

		shader.uniform('uAoMap', 'uniform1i', 0);
		shader.uniform('uRadianceMap', 'uniform1i', 1);
		shader.uniform('uIrradianceMap', 'uniform1i', 2);
		textureAO.bind(0);
		textureRad.bind(1);
		textureIrr.bind(2);

		shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		shader.uniform('uRoughness', 'uniform1f', this.roughness);
		shader.uniform('uMetallic', 'uniform1f', this.metallic);
		shader.uniform('uSpecular', 'uniform1f', this.specular);

		shader.uniform('uExposure', 'uniform1f', params.exposure);
		shader.uniform('uGamma', 'uniform1f', params.gamma);

		shader.uniform("uTime", "float", this.time);

		GL.draw(this.mesh);
	}


}

export default ViewDisks;
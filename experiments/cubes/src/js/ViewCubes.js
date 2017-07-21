// ViewCubes.js

import alfrid, { GL } from 'alfrid';


const vs = require('../shaders/cubes.vert');
const fs = require('../shaders/pbr.frag');

let numCubes, cubeSize;

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		numCubes = params.numCubes;
		cubeSize = params.cubeSize;
		// const cubeSize = .15;
		const meshCube = alfrid.Geom.cube(cubeSize, cubeSize, cubeSize);

		const mesh = new alfrid.Mesh();

		const positions = meshCube.vertices;
		const coords = meshCube.coords;
		const normals = meshCube.normals;
		const indices = meshCube.indices;

		mesh.bufferVertex(positions);
		mesh.bufferTexCoord(coords);
		mesh.bufferNormal(normals);
		mesh.bufferIndex(indices);

		const positionOffsets = [];
		let x, y, z;

		const sp = -cubeSize * numCubes * 0.5 + cubeSize/2;

		for (let k=0; k<numCubes; k++) {
			for (let j=0; j<numCubes; j++) {
				for (let i=0; i<numCubes; i++) {
					x = sp + i * cubeSize;
					y = sp + j * cubeSize;
					z = sp + k * cubeSize;

					positionOffsets.push([x, y, z]);
				}
			}
		}

		mesh.bufferInstance(positionOffsets, 'aOffset');

		this.mesh = mesh;

		this.roughness = .5;
		this.specular = 0;
		this.metallic = 0.5;
		this.baseColor = [1, 0, 0];
	}


	render(textureRad, textureIrr, textureAO, hit) {
		if(!this.mesh) {
			return;
		}

		this.time += 0.01;
		this.shader.bind();

		this.shader.uniform('uAoMap', 'uniform1i', 0);
		this.shader.uniform('uRadianceMap', 'uniform1i', 1);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		textureAO.bind(0);
		textureRad.bind(1);
		textureIrr.bind(2);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);
		this.shader.uniform("uTime", "float", this.time);
		this.shader.uniform("uHit", "vec3", hit);

		GL.draw(this.mesh);
	}


}

export default ViewCubes;
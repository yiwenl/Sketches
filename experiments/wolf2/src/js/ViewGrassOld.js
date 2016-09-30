
// ViewGrass.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/grass.vert';
import fs from '../shaders/grass.frag';

const random = function (min, max) { return min + Math.random() * (max - min);	};
const colours = [
	[64 / 255, 109 / 255, 26 / 255],
	[97 / 255, 148 / 255, 41 / 255],
	[113 / 255, 162 / 255, 55 / 255],
	[98 / 255, 154 / 255, 39 / 255],
	[128 / 255, 171 / 255, 71 / 255]
];

const getColor = function() {
	return colours[Math.floor(Math.random() * colours.length)];
}


const flatDistance = function(a, b) {
	const dx = a[0] - b[0];
	const dz = a[2] - b[2];
	return Math.sqrt( dx * dx + dz * dz );
}


const isSameDirection = function(pos) {
	const a = vec3.fromValues(pos[0], 0, pos[2]);
	vec3.normalize(a, a);
	const p = GL.camera.position;
	const b = vec3.fromValues(p[0], 0.0, p[2]);
	vec3.normalize(b, b);
	const d = vec3.dot(a, b);

	return d < 0.5;
}

class ViewGrass extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const positions = [];
		const coords = [];
		const indices = [];
		const normals = [];
		const NUM_GRASS = 3000;
		const RANGE = params.grassRange;
		let index = 0;

		const W = 1.5;
		const H = W;
		const m = mat4.create();

		function rotate(v, a) {
			let vv = vec3.clone(v);
			mat4.identity(m, m);
			mat4.rotateY(m, m, a);
			vec3.transformMat4(vv, vv, m);

			return vv;
		}

		function addPlane(angle) {
			const yOffset = 0;
			positions.push(rotate([-W, 0+yOffset, 0], angle));
			positions.push(rotate([ W, 0+yOffset, 0], angle));
			positions.push(rotate([ W, H+yOffset, 0], angle));
			positions.push(rotate([-W, H+yOffset, 0], angle));

			coords.push([0, 0]);
			coords.push([1, 0]);
			coords.push([1, 1]);
			coords.push([0, 1]);

			normals.push(rotate([0, 0, 1], angle));
			normals.push(rotate([0, 0, 1], angle));
			normals.push(rotate([0, 0, 1], angle));
			normals.push(rotate([0, 0, 1], angle));

			indices.push(index*4 + 0);
			indices.push(index*4 + 1);
			indices.push(index*4 + 2);
			indices.push(index*4 + 0);
			indices.push(index*4 + 2);
			indices.push(index*4 + 3);
			
			index ++;
		}

		const RAD = Math.PI / 180;
		addPlane(0);
		addPlane(120 * RAD);
		addPlane(240 * RAD);

		const terrainSize = params.terrainSize / 2;

		function getMesh(numInstances) {
			const mesh = new alfrid.Mesh();
			mesh.bufferVertex(positions);
			mesh.bufferNormal(normals);
			mesh.bufferTexCoord(coords);
			mesh.bufferIndex(indices);

			const positionOffsets = [];
			const colors = [];
			const extras = [];
			const uvOffsets = [];

			for(let i = 0; i < numInstances; i++) {
				let pos = [random(-RANGE, RANGE), random(1, 2.5), random(-RANGE, RANGE)];
				let u = (pos[0] / terrainSize) * .5 + .5;
				let v = (pos[2] / terrainSize) * .5 + .5;

				positionOffsets.push(pos);
				colors.push(getColor());
				extras.push([Math.random() > .5 ? 0 : .5, Math.random() * Math.PI * 2 ]);
				uvOffsets.push([u, 1.0-v]);
			}

			mesh.bufferInstance(positionOffsets, 'aPosOffset');
			mesh.bufferInstance(colors, 'aColor');
			mesh.bufferInstance(extras, 'aExtra');
			mesh.bufferInstance(uvOffsets, 'aUVOffset');

			return mesh;
		}

		this.mesh = getMesh(NUM_GRASS);
	}


	render(mHit, textureGrass, textureNoise, textureHeight) {
		const moveDist = params.speed * params.terrainSize / 2;
		const distForward = params.time * moveDist * 500;

		this.shader.bind();
		this.shader.uniform("uHit", "vec3", mHit);
		this.shader.uniform("uPushStrength", "float", params.pushStrength);
		this.shader.uniform("uRange", "float", params.grassRange);
		this.shader.uniform("uMaxHeight", "float", params.maxHeight);
		this.shader.uniform("uDistForward", "float", distForward);
		this.shader.uniform("uTerrainSize", "float", params.terrainSize/2);

		this.shader.uniform("textureGrass", "uniform1i", 0);
		textureGrass.bind(0);

		this.shader.uniform("textureNoise", "uniform1i", 1);
		textureNoise.bind(1);

		this.shader.uniform("textureHeight", "uniform1i", 2);
		textureHeight.bind(2);
/*
		this.shader.uniform("textureGrassHeight", "uniform1i", 3);
		this.textureGrassHeight.bind(3);
	*/

		GL.drawInstance(this.mesh);	
	}


}

export default ViewGrass;
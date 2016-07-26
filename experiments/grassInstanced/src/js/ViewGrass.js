// ViewGrass.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/grassSimple.vert';
import fs from '../shaders/grassSimple.frag';

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
		const indices = [0, 1, 2, 0, 2, 3];
		const normals = [];
		const NUM_GRASS = 5000 * 5;
		const RANGE = params.grassRange;

		const W = .1;
		const H = 1;
		positions.push([-W, 0, 0]);
		positions.push([ W, 0, 0]);
		positions.push([ W, H, 0]);
		positions.push([-W, H, 0]);

		coords.push([0, 0]);
		coords.push([1, 0]);
		coords.push([1, 1]);
		coords.push([0, 1]);

		normals.push([0, 0, 1]);
		normals.push([0, 0, 1]);
		normals.push([0, 0, 1]);
		normals.push([0, 0, 1]);

		function getMesh(numInstances) {
			const mesh = new alfrid.Mesh();
			mesh.bufferVertex(positions);
			mesh.bufferNormal(normals);
			mesh.bufferTexCoord(coords);
			mesh.bufferIndex(indices);

			const positionOffsets = [];
			const colors = [];

			for(let i = 0; i < numInstances; i++) {
				positionOffsets.push([random(-RANGE, RANGE), random(1, 1.5), random(-RANGE, RANGE), Math.random() * Math.PI * 2]);
				colors.push(getColor());
			}

			console.log('Number of Grass : ', positionOffsets.length);

			mesh.bufferInstance(positionOffsets, 'aPosOffset');
			mesh.bufferInstance(colors, 'aColor');

			return mesh;
		}

		this.mesh = getMesh(NUM_GRASS);
		this.meshFewer = getMesh(NUM_GRASS * 0.25);
		this.meshFewest = getMesh(NUM_GRASS * 0.05);

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];

		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);
	}


	render(mHit, textureRad, textureIrr) {
		this.shader.bind();

		this.shader.uniform('uRadianceMap', 'uniform1i', 0);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 1);
		textureRad.bind(0);
		textureIrr.bind(1);

		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);
		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		this.shader.uniform("uHit", "vec3", mHit);
		this.shader.uniform("uPushStrength", "float", params.pushStrength);
		const numTiles = params.numTiles;
		const pos = [0, 0, 0];
		const uvOffset = [0, 0];
		const r = params.grassRange * 2.0;
		const start = (-numTiles / 2 + 0.5) * r;
		let count = 0;

		for(let j = 0; j < numTiles; j++) {
			for(let i = 0; i < numTiles; i++) {
				pos[0] = start + r * i;
				pos[2] = start + r * j;

				uvOffset[0] = i/numTiles;
				uvOffset[1] = j/numTiles;
				this.shader.uniform('uPositionOffset', 'vec3', pos);
				this.shader.uniform('uUVOffset', 'vec2', uvOffset);

				// GL.drawInstance(this.mesh);
				const distToCam = flatDistance(pos, GL.camera.position);
				if( distToCam < params.lodThresholdHigh) {
					GL.drawInstance(this.mesh);	
					count += 5000;
				} else if(distToCam < params.lodThresholdLow) {
					if(!isSameDirection(pos)) continue;
					GL.drawInstance(this.meshFewer);
					count += 5000 * 0.25;
				} else {
					if(!isSameDirection(pos)) continue;
					GL.drawInstance(this.meshFewest);
					count += 5000 * 0.05;
				}
			}
		}

		// console.log('total grass:', count);
	}


}

export default ViewGrass;
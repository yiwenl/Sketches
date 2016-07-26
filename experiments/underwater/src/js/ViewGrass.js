// ViewGrass.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/grass.vert';
import fs from '../shaders/grass.frag';

const random = function (min, max) { return min + Math.random() * (max - min);	};
/*/
const colours = [
	[166 / 255, 42 / 255, 86 / 255],
	[239 / 255, 161 / 255, 184 / 255],
	[251 / 255, 216 / 255, 169 / 255],
	[180 / 255, 107 / 255, 97 / 255],
	[253 / 255, 233 / 255, 222 / 255],
	[91 / 255, 36 / 255, 65 / 255],
	[225 / 255, 167 / 255, 86 / 255]
];
/*/
const colours = [
	[255 / 255, 255 / 255, 255 / 255],
	[230 / 255, 230 / 255, 230 / 255],
	[215 / 255, 215 / 255, 215 / 255],
	[160 / 255, 160 / 255, 160 / 255],
	[175 / 255, 175 / 255, 175 / 255],
	[240 / 255, 240 / 255, 240 / 255],
	[180 / 255, 180 / 255, 180 / 255]
];
//*/

const getColor = function() {
	return colours[Math.floor(Math.random() * colours.length)];
}


const flatDistance = function(a, b) {
	const dx = a[0] - b[0];
	const dz = a[2] - b[2];
	return Math.sqrt( dx * dx + dz * dz );
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
		const NUM_GRASS = 5000;
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
		this.meshFewer = getMesh(NUM_GRASS * 0.5);
		this.meshFewest = getMesh(NUM_GRASS * 0.1);

		this.roughness = .9;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
	}


	render(textureRad, textureIrr) {
		this.shader.bind();

		const numTiles = params.numTiles;
		const pos = [0, 0, 0];
		const uvOffset = [0, 0];
		const r = params.grassRange * 2.0;
		const start = (-numTiles / 2 + 0.5) * r;

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

		for(let j = 0; j < numTiles; j++) {
			for(let i = 0; i < numTiles; i++) {
				pos[0] = start + r * i;
				pos[2] = start + r * j;

				uvOffset[0] = i/numTiles;
				uvOffset[1] = j/numTiles;
				this.shader.uniform('uPositionOffset', 'vec3', pos);
				this.shader.uniform('uUVOffset', 'vec2', uvOffset);
				// this.shader.uniform("uHit", "vec3", mHit);

				// GL.drawInstance(this.mesh);
				const distToCam = flatDistance(pos, GL.camera.position);
				if( distToCam < params.lodThresholdHigh) {
					GL.drawInstance(this.mesh);	
				} else if(distToCam < params.lodThresholdLow) {
					GL.drawInstance(this.meshFewer);
				} else {
					GL.drawInstance(this.meshFewest);
				}
			}
		}
	}


}

export default ViewGrass;
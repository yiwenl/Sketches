// ViewGrass.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/grass.vert';
import fs from '../shaders/grass.frag';

const random = function(min, max) { return min + Math.random() * (max - min);	}
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

class ViewGrass extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this._traveled = 0;
	}


	_init() {
		const positions = [];
		const coords = [];
		const indices = [];
		const normals = [];
		const NUM_GRASS = 2000;
		const RANGE = params.terrainSize/2;
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

			for(let i = 0; i < numInstances; i++) {
				let pos = [random(-RANGE, RANGE), random(1, 2.5), random(-RANGE, RANGE)];

				positionOffsets.push(pos);
				colors.push(getColor());
				extras.push([Math.random() > .5 ? 0 : .5, Math.random() * Math.PI * 2 ]);
			}

			mesh.bufferInstance(positionOffsets, 'aPosOffset');
			mesh.bufferInstance(colors, 'aColor');
			// mesh.bufferInstance(extras, 'aExtra');

			return mesh;
		}

		this.mesh = getMesh(NUM_GRASS);

		this._textureGrass = new alfrid.GLTexture(getAsset('grass'));
	}


	render(textureHeight, textureNormal, uvWolf) {
		const { maxHeight, terrainSize, speed, noiseScale, isOne } = params;
		const totalDist = terrainSize / noiseScale;
		this._traveled += speed;
		const distForward = this._traveled * totalDist;

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this._textureGrass.bind(0);
		this.shader.uniform("textureHeight", "uniform1i", 1);
		textureHeight.bind(1);
		this.shader.uniform("textureNormal", "uniform1i", 2);
		textureNormal.bind(2);

		this.shader.uniform("uMaxHeight", "float", maxHeight);
		this.shader.uniform("uTerrainSize", "float", terrainSize/2);
		this.shader.uniform("uDistForward", "float", distForward);
		this.shader.uniform("uUVWolf", "vec2", uvWolf);

		GL.draw(this.mesh);
	}


}

export default ViewGrass;
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

const distance = function(a, b) {
	let dx = a[0] - b[0];
	let dz = a[2] - b[2];
	return Math.sqrt( dx * dx + dz * dz);
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
		const NUM_GRASS = GL.isMobile ? 500 : 5000;
		const RANGE = params.terrainSize/2 * 0.8;

		this.range = RANGE;

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
			const yOffset = 0.2;
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
			let cnt = 0;

			function checkDist(pos) {
				if(positionOffsets.length == 0) {
					return false;
				}

				const MIN_DIST = 1.14;
				let p, d;
				for(let i=0; i<positionOffsets.length; i++) {
					p = positionOffsets[i];
					d = distance(p, pos);

					if( d < MIN_DIST) {
						return true;
					}
				}

				return false;
			}

			for(let i = 0; i < numInstances; i++) {
				let pos;
				let pos2D;
				cnt = 0;
				do {
					pos = [random(-RANGE, RANGE), random(1.65, 1.5), random(-RANGE, RANGE)];	
					cnt ++;
				} while(checkDist(pos) && cnt < 100);

				positionOffsets.push(pos);
				colors.push(getColor());
				extras.push([Math.random() > .5 ? 0 : .5, Math.random() * Math.PI * 2 ]);
			}

			mesh.bufferInstance(positionOffsets, 'aPosOffset');
			mesh.bufferInstance(colors, 'aColor');
			mesh.bufferInstance(extras, 'aExtra');

			return mesh;
		}

		this.mesh = getMesh(NUM_GRASS);

		this._textureGrass = new alfrid.GLTexture(getAsset('grass'));
	}


	render(textureHeight, textureNormal, uvWolf, lightIntensity, textureNoise) {
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
		this.shader.uniform("textureNoise", "uniform1i", 3);
		textureNoise.bind(3);

		this.shader.uniform("uVRViewMatrix", "mat4", mView);
		this.shader.uniform("uVRProjectionMatrix", "mat4", mProj);

		this.shader.uniform("uMaxHeight", "float", maxHeight);
		this.shader.uniform("uTerrainSize", "float", this.range);
		this.shader.uniform("uDistForward", "float", distForward);
		this.shader.uniform("uUVWolf", "vec2", uvWolf);
		this.shader.uniform("uLightIntensity", "float", lightIntensity);
		this.shader.uniform("uYOffset", "float", params.yOffset);

		GL.draw(this.mesh);
	}


}

export default ViewGrass;
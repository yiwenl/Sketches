// ViewGrass.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/grass.vert';
import fs from '../shaders/grass.frag';
import fsFar from '../shaders/grassFar.frag';
var random = function(min, max) { return min + Math.random() * (max - min);	}
const colours = [
	[64/255, 109/255, 26/255],
	[97/255, 148/255, 41/255],
	[113/255, 162/255, 55/255],
	[98/255, 154/255, 39/255],
	[128/255, 171/255, 71/255]
];

const getColor = function() {
	return colours[Math.floor(Math.random() * colours.length)];
}


const floatDistance = function(a, b) {
	const dx = a[0] - b[0];
	const dz = a[2] - b[2];
	return Math.sqrt( dx * dx + dz * dz );
}


const getDirection = function(pos, viewDir) {
	const dirToCamera = vec3.create();
	vec3.sub(dirToCamera, pos, GL.camera.position);
	vec3.normalize(dirToCamera, dirToCamera);

	return vec3.dot(pos, viewDir);
}

class ViewGrass extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this.shaderFar = new alfrid.GLShader(vs, fsFar);
	}


	_init() {
		const positions = [], positionsFewer = [], positionsFewest = [];
		const posOffset = [], posOffsetFewer = [], posOffsetFewest = [];
		const colors = [], colorsFewer = [], colorsFewest = [];
		const normals = [], normalsFewer = [], normalsFewest = [];
		const indices = [], indicesFewer = [], indicesFewest = [];
		const coords = [], coordsFewer = [], coordsFewest = [];
		const uv = [], uvFewer = [], uvFewest = [];
		let count = 0;
		let countFewer = 0;
		let countFewest = 0;
		let temp = 0;

		let numSeg = 2;
		const NUM_GRASS = 5000;
		const RANGE = params.grassRange;
		const uvOffset = 1/numSeg;
		const skipFewer = 5;
		const skipFewest = 10;
		let width, height, h, tx, tz, uvx, uvz, rx, ry, color;
		let m = mat4.create();

		function rotateY(v, a) {
			mat4.identity(m, m);
			mat4.rotateY(m, m, a);

			let vv = vec3.clone(v);
			vec3.transformMat4(vv, v, m);
			return vv;
		}

		for(let j=0; j < NUM_GRASS; j++) {
			height = random(1, 2);
			width = random(.1, .2) * .5;
			tx = random(-RANGE, RANGE);
			tz = random(-RANGE, RANGE);
			uvx = tx / RANGE * .5 + .5;
			uvz = tz / RANGE * .5 + .5;

			rx = Math.random();
			ry = Math.random() * Math.PI * 2.0;

			color = getColor();

			numSeg = 2;
			h = height / numSeg;
			for(let i=0; i<numSeg; i++) {
				positions.push(rotateY([ width, h * (i+1), 0], ry));
				positions.push(rotateY([-width, h * (i+1), 0], ry));
				positions.push(rotateY([-width, h * i, 0], ry));
				positions.push(rotateY([ width, h * i, 0], ry));

				posOffset.push([tx, rx, tz]);
				posOffset.push([tx, rx, tz]);
				posOffset.push([tx, rx, tz]);
				posOffset.push([tx, rx, tz]);

				normals.push(rotateY([0, 0, 1], ry));
				normals.push(rotateY([0, 0, 1], ry));
				normals.push(rotateY([0, 0, 1], ry));
				normals.push(rotateY([0, 0, 1], ry));

				colors.push(color);
				colors.push(color);
				colors.push(color);
				colors.push(color);

				uv.push([uvx, uvz]);
				uv.push([uvx, uvz]);
				uv.push([uvx, uvz]);
				uv.push([uvx, uvz]);

				coords.push([0, uvOffset*(i+1)]);
				coords.push([1, uvOffset*(i+1)]);
				coords.push([1, uvOffset*i]);
				coords.push([0, uvOffset*i]);

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);

				count ++;
			}

			numSeg = 2;
			h = height / numSeg;
			if(temp % skipFewer === 0) {
				for(let i=0; i<numSeg; i++) {
					positionsFewer.push(rotateY([ width, h * (i+1), 0], ry));
					positionsFewer.push(rotateY([-width, h * (i+1), 0], ry));
					positionsFewer.push(rotateY([-width, h * i, 0], ry));
					positionsFewer.push(rotateY([ width, h * i, 0], ry));

					posOffsetFewer.push([tx, rx, tz]);
					posOffsetFewer.push([tx, rx, tz]);
					posOffsetFewer.push([tx, rx, tz]);
					posOffsetFewer.push([tx, rx, tz]);

					normalsFewer.push(rotateY([0, 0, 1], ry));
					normalsFewer.push(rotateY([0, 0, 1], ry));
					normalsFewer.push(rotateY([0, 0, 1], ry));
					normalsFewer.push(rotateY([0, 0, 1], ry));

					colorsFewer.push(color);
					colorsFewer.push(color);
					colorsFewer.push(color);
					colorsFewer.push(color);

					uvFewer.push([uvx, uvz]);
					uvFewer.push([uvx, uvz]);
					uvFewer.push([uvx, uvz]);
					uvFewer.push([uvx, uvz]);

					coordsFewer.push([0, uvOffset*(i+1)]);
					coordsFewer.push([1, uvOffset*(i+1)]);
					coordsFewer.push([1, uvOffset*i]);
					coordsFewer.push([0, uvOffset*i]);

					indicesFewer.push(countFewer * 4 + 0);
					indicesFewer.push(countFewer * 4 + 1);
					indicesFewer.push(countFewer * 4 + 2);
					indicesFewer.push(countFewer * 4 + 0);
					indicesFewer.push(countFewer * 4 + 2);
					indicesFewer.push(countFewer * 4 + 3);

					countFewer ++;
				}
			}

			numSeg = 1;
			h = height / numSeg;
			if(temp % skipFewest === 0) {
				for(let i=0; i<numSeg; i++) {
					positionsFewest.push(rotateY([ width, h * (i+1), 0], ry));
					positionsFewest.push(rotateY([-width, h * (i+1), 0], ry));
					positionsFewest.push(rotateY([-width, h * i, 0], ry));
					positionsFewest.push(rotateY([ width, h * i, 0], ry));

					posOffsetFewest.push([tx, rx, tz]);
					posOffsetFewest.push([tx, rx, tz]);
					posOffsetFewest.push([tx, rx, tz]);
					posOffsetFewest.push([tx, rx, tz]);

					normalsFewest.push(rotateY([0, 0, 1], ry));
					normalsFewest.push(rotateY([0, 0, 1], ry));
					normalsFewest.push(rotateY([0, 0, 1], ry));
					normalsFewest.push(rotateY([0, 0, 1], ry));

					colorsFewest.push(color);
					colorsFewest.push(color);
					colorsFewest.push(color);
					colorsFewest.push(color);

					uvFewest.push([uvx, uvz]);
					uvFewest.push([uvx, uvz]);
					uvFewest.push([uvx, uvz]);
					uvFewest.push([uvx, uvz]);

					coordsFewest.push([0, uvOffset*(i+1)]);
					coordsFewest.push([1, uvOffset*(i+1)]);
					coordsFewest.push([1, uvOffset*i]);
					coordsFewest.push([0, uvOffset*i]);

					indicesFewest.push(countFewest * 4 + 0);
					indicesFewest.push(countFewest * 4 + 1);
					indicesFewest.push(countFewest * 4 + 2);
					indicesFewest.push(countFewest * 4 + 0);
					indicesFewest.push(countFewest * 4 + 2);
					indicesFewest.push(countFewest * 4 + 3);

					countFewest ++;
				}
			}

			temp ++;
		}

		console.log(positions.length, positionsFewer.length, positionsFewest.length);
		this.mesh = new alfrid.Mesh(GL.TIRANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferData(posOffset, 'aPosOffset', 3);
		this.mesh.bufferData(colors, 'aColor', 3);
		this.mesh.bufferData(uv, 'aUVOffset', 2);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferIndex(indices);

		this.meshFewer = new alfrid.Mesh(GL.TIRANGLES);
		this.meshFewer.bufferVertex(positionsFewer);
		this.meshFewer.bufferData(posOffsetFewer, 'aPosOffset', 3);
		this.meshFewer.bufferData(colorsFewer, 'aColor', 3);
		this.meshFewer.bufferData(uvFewer, 'aUVOffset', 2);
		this.meshFewer.bufferTexCoord(coordsFewer);
		this.meshFewer.bufferNormal(normalsFewer);
		this.meshFewer.bufferIndex(indicesFewer);

		this.meshFewest = new alfrid.Mesh(GL.TIRANGLES);
		this.meshFewest.bufferVertex(positionsFewest);
		this.meshFewest.bufferData(posOffsetFewest, 'aPosOffset', 3);
		this.meshFewest.bufferData(colorsFewest, 'aColor', 3);
		this.meshFewest.bufferData(uvFewest, 'aUVOffset', 2);
		this.meshFewest.bufferTexCoord(coordsFewest);
		this.meshFewest.bufferNormal(normalsFewest);
		this.meshFewest.bufferIndex(indicesFewest);

		this.roughness = 1.0;
		this.specular = 0.5;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
	}


	render(textureNoise, touch, textureRad, textureIrr) {
		const numTiles = params.numTiles;
		const pos = [0, 0, 0];
		const uvOffset = [0, 0];
		const r = params.grassRange * 2.0;
		const start = (-numTiles/2 + 0.5) * r;
		const maxSize = params.numTiles * params.grassRange;

		this.positionOffsets = [];
		this.distances = [];


		this.shader.bind();
		this.shader.uniform("uNumTiles", "float", params.numTiles);
		this.shader.uniform("textureNoise", "uniform1i", 0);
		this.shader.uniform("uTouch", "vec3", touch);
		textureNoise.bind(0);

		this.shader.uniform('uRadianceMap', 'uniform1i', 1);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 2);
		textureRad.bind(1);
		textureIrr.bind(2);

		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);
		this.shader.uniform('uFogOffset', 'uniform1f', params.fogOffset);
		this.shader.uniform('uFogColor', 'vec3', params.fogColor);

		let viewDir = vec3.clone(GL.camera.position);
		vec3.scale(viewDir, viewDir, -1);
		vec3.normalize(viewDir, viewDir);
		let directions = [];
		let count = 0;


		for(let j=0; j<numTiles; j++) {
			for(let i=0; i<numTiles; i++) {
				pos[0] = start + r * i;
				pos[2] = start + r * j + params.zOffset;
				while(pos[2] < -maxSize) {
					pos[2] += maxSize * 2;
				}


				uvOffset[0] = i/numTiles;
				uvOffset[1] = j/numTiles;
				this.shader.uniform("uPositionOffset", "vec3", pos);
				this.shader.uniform("uUVOffset", "vec2", uvOffset);
				const distToCam = floatDistance(pos, GL.camera.position);
				if( distToCam < params.lodThresholdHigh) {
					GL.draw(this.mesh);	
				} else if(distToCam < params.lodThresholdLow) {
					GL.draw(this.meshFewer);
				} else {
					// GL.draw(this.meshFewest);
				}
				
				
				this.positionOffsets.push([pos[0], 0, pos[2]]);
				this.distances.push(distToCam);
			}
		}

		this.shaderFar.bind();
		this.shaderFar.uniform('uRadianceMap', 'uniform1i', 1);
		this.shaderFar.uniform('uIrradianceMap', 'uniform1i', 2);
		textureRad.bind(1);
		textureIrr.bind(2);
		this.shaderFar.uniform("uNumTiles", "float", params.numTiles);
		this.shaderFar.uniform("textureNoise", "uniform1i", 0);
		this.shaderFar.uniform("uTouch", "vec3", touch);
		this.shaderFar.uniform('uExposure', 'uniform1f', params.exposure);
		this.shaderFar.uniform('uGamma', 'uniform1f', params.gamma);
		this.shaderFar.uniform('uFogOffset', 'uniform1f', params.fogOffset);
		this.shaderFar.uniform('uFogColor', 'vec3', params.fogColor);
		textureNoise.bind(0);

		for(let j=0; j<numTiles; j++) {
			for(let i=0; i<numTiles; i++) {
				pos[0] = start + r * i;
				pos[2] = start + r * j + params.zOffset;
				while(pos[2] < -maxSize) {
					pos[2] += maxSize * 2;
				}

				let dir = getDirection(pos, viewDir);
				directions.push(dir);

				uvOffset[0] = i/numTiles;
				uvOffset[1] = j/numTiles;
				this.shaderFar.uniform("uPositionOffset", "vec3", pos);
				this.shaderFar.uniform("uUVOffset", "vec2", uvOffset);
				const distToCam = floatDistance(pos, GL.camera.position);
				if( distToCam < params.lodThresholdHigh) {
					// GL.draw(this.mesh);	
				} else if(distToCam < params.lodThresholdLow) {
					// GL.draw(this.meshFewer);
				} else {
					GL.draw(this.meshFewest);
				}
				
			}
		}
		
	}


}

export default ViewGrass;
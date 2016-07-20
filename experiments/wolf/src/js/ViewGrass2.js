// ViewGrass2.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/grass2.vert';
import fs from '../shaders/grass2.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

const flatDistance = function(a, b) {
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

class ViewGrass2 extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh;

		const NUM_GRASS = 200;
		const RANGE = params.grassRange;
		let uvOffset;


		const oNormal = {
			positions: [],
			posOffset: [],
			normals: [],
			uvs: [],
			indices: [],
			extras: [],
			coords: [],
			count: 0
		}

		const oFewer = {
			positions: [],
			posOffset: [],
			normals: [],
			uvs: [],
			indices: [],
			extras: [],
			coords: [],
			count: 0
		}

		const oFewest = {
			positions: [],
			posOffset: [],
			normals: [],
			uvs: [],
			indices: [],
			extras: [],
			coords: [],
			count: 0
		}


		let h = 2;
		let a = 0;
		let w = 1;
		let tx, tz, uvx, uvz;
		const m = mat4.create();


		function rotate(v, a) {
			mat4.identity(m, m);
			mat4.rotateY(m, m, a);
			let vv = vec3.create();
			vec3.transformMat4(vv, v, m);
			return vv;
		}

		

		for(let i=0; i<NUM_GRASS; i++) {
			tx = random(-RANGE, RANGE);
			tz = random(-RANGE, RANGE);
			uvx = tx / RANGE * .5 + .5;
			uvz = tz / RANGE * .5 + .5;
			uvOffset = Math.random() > .5 ? .5 : 0;
			h = random(2, 3) * .7;
			w = random(1, 2) * .7;


			function addMesh(a, target=oNormal) {
				target['positions'].push(rotate([-w, 0, 0], a));
				target['positions'].push(rotate([ w, 0, 0], a));
				target['positions'].push(rotate([ w, h, 0], a));
				target['positions'].push(rotate([-w, h, 0], a));

				target['posOffset'].push([tx, 0, tz]);
				target['posOffset'].push([tx, 0, tz]);
				target['posOffset'].push([tx, 0, tz]);
				target['posOffset'].push([tx, 0, tz]);

				target['normals'].push(rotate([0, 0, 1], a));
				target['normals'].push(rotate([0, 0, 1], a));
				target['normals'].push(rotate([0, 0, 1], a));
				target['normals'].push(rotate([0, 0, 1], a));

				target['extras'].push([uvOffset, 0, 0]);
				target['extras'].push([uvOffset, 0, 0]);
				target['extras'].push([uvOffset, 0, 0]);
				target['extras'].push([uvOffset, 0, 0]);

				target['uvs'].push([uvx, uvz]);
				target['uvs'].push([uvx, uvz]);
				target['uvs'].push([uvx, uvz]);
				target['uvs'].push([uvx, uvz]);

				target['coords'].push([0, 0]);
				target['coords'].push([0.5, 0]);
				target['coords'].push([0.5, 1]);
				target['coords'].push([0, 1]);

				target['indices'].push(target['count'] * 4 + 0);
				target['indices'].push(target['count'] * 4 + 1);
				target['indices'].push(target['count'] * 4 + 2);
				target['indices'].push(target['count'] * 4 + 0);
				target['indices'].push(target['count'] * 4 + 2);
				target['indices'].push(target['count'] * 4 + 3);

				target['count'] ++;	
			}


			function addMeshes(target) {
				const RAD = Math.PI / 180;
				const a = Math.PI * 2.0 * Math.random()
				addMesh(a, target);
				addMesh(a + 120 * RAD, target);
				addMesh(a + 240 * RAD, target);
			}

			addMeshes(oNormal);
			if(i % 8 == 0) addMeshes(oFewer);
			if ( i % 16 == 0) addMeshes(oFewest);
		}


		function getMesh(o) {
			const mesh = new alfrid.Mesh();
			mesh.bufferVertex(o.positions);
			mesh.bufferData(o.posOffset, 'aPosOffset', 3);
			mesh.bufferData(o.extras, 'aExtra', 3);
			mesh.bufferData(o.uvs, 'aUVOffset', 2);
			mesh.bufferTexCoord(o.coords);
			mesh.bufferNormal(o.normals);
			mesh.bufferIndex(o.indices);

			return mesh;			
		}

		this.mesh = getMesh(oNormal);
		this.meshFewer = getMesh(oFewer);
		this.meshFewest = getMesh(oFewest);

		this._textureGrass = new alfrid.GLTexture(getAsset('grass'));
	}


	render(textureNoise) {
		const numTiles = params.numTiles;
		const pos = [0, 0, 0];
		const uvOffset = [0, 0];
		const r = params.grassRange * 2.0;
		const start = (-numTiles/2 + 0.5) * r;

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this._textureGrass.bind(0);
		this.shader.uniform("textureNoise", "uniform1i", 1);
		textureNoise.bind(1);

		this.shader.uniform("uNumTiles", "float", params.numTiles);
		// GL.draw(this.mesh);
		let cnt = 0;
		for ( let k = 0; k < 3; k++) {
			for(let j=numTiles-1; j>=0; j--) {
				for(let i=0; i<numTiles; i++) {
					pos[0] = start + r * i;
					pos[2] = start + r * j;

					uvOffset[0] = i/numTiles;
					uvOffset[1] = j/numTiles;
					this.shader.uniform("uPositionOffset", "vec3", pos);
					this.shader.uniform("uUVOffset", "vec2", uvOffset);

					const distToCam = flatDistance(pos, GL.camera.position);
					if( distToCam < params.lodThresholdHigh && k == 0) {
						GL.draw(this.mesh);	
					} else if(distToCam < params.lodThresholdLow && k == 1) {
						GL.draw(this.meshFewer);
					} else if(distToCam >= params.lodThresholdLow && k == 2) {
						GL.draw(this.meshFewest);
					}
				}
			}	
		}

		
	}


}

export default ViewGrass2;
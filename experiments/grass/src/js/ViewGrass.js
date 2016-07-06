// ViewGrass.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/grass.vert';
import fs from '../shaders/grass.frag';
var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewGrass extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const positions = [];
		const posOffset = [];
		const normals = [];
		const indices = [];
		const coords = [];
		const uv = [];
		let count = 0;

		const numSeg = 3;
		const NUM_GRASS = 5000;
		const RANGE = params.grassRange;
		const uvOffset = 1/numSeg;
		let width, height, h, tx, tz, uvx, uvz, rx, ry;

		for(let j=0; j < NUM_GRASS; j++) {
			height = random(2, 3);
			width = random(.1, .2) * .5;
			h = height / numSeg;
			tx = random(-RANGE, RANGE);
			tz = random(-RANGE, RANGE);
			uvx = tx / RANGE * .5 + .5;
			uvz = tz / RANGE * .5 + .5;

			rx = Math.random();
			ry = Math.random();


			for(let i=0; i<numSeg; i++) {
				positions.push([ width, h * (i+1), 0]);
				positions.push([-width, h * (i+1), 0]);
				positions.push([-width, h * i, 0]);
				positions.push([ width, h * i, 0]);

				posOffset.push([tx, 0, tz]);
				posOffset.push([tx, 0, tz]);
				posOffset.push([tx, 0, tz]);
				posOffset.push([tx, 0, tz]);

				normals.push([rx, ry, 1]);
				normals.push([rx, ry, 1]);
				normals.push([rx, ry, 1]);
				normals.push([rx, ry, 1]);

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

		}

		this.mesh = new alfrid.Mesh(GL.TIRANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferData(posOffset, 'aPosOffset', 3);
		this.mesh.bufferData(uv, 'aUVOffset', 2);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferIndex(indices);
	}


	render(textureNoise, touch) {
		const numTiles = params.numTiles;
		const pos = [0, 0, 0];
		const uvOffset = [0, 0];
		const r = params.grassRange * 2.0;
		const start = (-numTiles/2 + 0.5) * r;


		this.shader.bind();
		this.shader.uniform("uNumTiles", "float", params.numTiles);
		this.shader.uniform("textureNoise", "uniform1i", 0);
		this.shader.uniform("uTouch", "vec3", touch);
		textureNoise.bind(0);

		for(let j=0; j<numTiles; j++) {
			for(let i=0; i<numTiles; i++) {
				pos[0] = start + r * i;
				pos[2] = start + r * j;
				uvOffset[0] = i/numTiles;
				uvOffset[1] = j/numTiles;
				this.shader.uniform("uPositionOffset", "vec3", pos);
				this.shader.uniform("uUVOffset", "vec2", uvOffset);
				GL.draw(this.mesh);
			}
		}
		
	}


}

export default ViewGrass;
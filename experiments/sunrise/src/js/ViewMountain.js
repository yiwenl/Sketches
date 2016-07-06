// ViewMountain.js

import alfrid from 'alfrid';
import Perlin from './Perlin';
let GL = alfrid.GL;
const vs = require('../shaders/basic.vert');
const fs = require('../shaders/mountain.frag');
var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewMountain extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.rotation = 0;
	}


	_init() {
		const NUM = 30;
		const uvGap = 1.0 / NUM;
		const SEED = Math.random() * 0xFF;
		const SIZE = random(0.5, .7) * 1.5;
		const posOffset = random(3.0, 7.0);
		const power = random(2, 5);
		const HEIGHT = random(.25, .7);
		const NOISE_HEIGHT = random(.25, .35);

		let positions = [];
		let coords = [];
		let indices = [];
		let count = 0;
		let normals = [];


		function getPosition(i, j) {
			let px = i/NUM;
			let py = j/NUM;
			let hx = Math.sin(px*Math.PI);
			let hy = Math.sin(py*Math.PI);
			let h = hx * hy;
			h = Math.pow(h, power);
			const x = -SIZE + px * 2.0 * SIZE;
			const z = SIZE - py * 2.0 * SIZE;
			
			const y = h * HEIGHT + Perlin.noise(x*posOffset, z*posOffset, SEED) * NOISE_HEIGHT * h;

			return [x, y, z];
		}

		function getNormal(p0, p1, p2) {
			const pp0 = vec3.clone(p0);
			const pp1 = vec3.clone(p1);
			const pp2 = vec3.clone(p2);

			let v0 = vec3.create();
			let v1 = vec3.create();

			vec3.sub(v0, pp1, pp0);
			vec3.sub(v1, pp2, pp0);

			let n = vec3.create();
			vec3.cross(n, v1, v0);
			vec3.normalize(n, n);

			return n;
		}

		
		for(let j=0; j<NUM; j++) {
			for(let i=0; i<NUM; i++) {
				let v0 = getPosition(i, j);
				let v1 = getPosition(i+1, j);
				let v2 = getPosition(i+1, j+1);
				let v3 = getPosition(i, j+1);

				positions.push(v0);
				positions.push(v1);
				positions.push(v2);
				positions.push(v3);

				let n = getNormal(v0, v1, v3);
				normals.push(n);
				normals.push(n);
				normals.push(n);
				normals.push(n);

				let u = i/NUM;
				let v = j/NUM;

				coords.push([u, v]);
				coords.push([u+uvGap, v]);
				coords.push([u+uvGap, v+uvGap]);
				coords.push([u, v+uvGap]);

				indices.push(count*4 + 0);
				indices.push(count*4 + 1);
				indices.push(count*4 + 2);
				indices.push(count*4 + 0);
				indices.push(count*4 + 2);
				indices.push(count*4 + 3);

				count++;
			}
		}

		this.mesh = new alfrid.Mesh(GL.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);
		this.mesh.bufferNormal(normals);


		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		const grey = 1.00;
		this.time = Math.random();
		this._position = vec3.create();
		this._scale = random(2.0, 4);
		this._modelMatrix = mat4.create();
		this.textureIndex = Math.floor(Math.random() * 35);

	}


	render(textureMountains, textureBg, isFlipped=false, shader, isFirst) {
		if(isFirst) {
			shader.bind();
		}
		
		shader.uniform("texture", "uniform1i", 0);
		textureMountains[this.textureIndex].bind(0);
		shader.uniform("textureBg", "uniform1i", 1);
		textureBg.bind(1);
		shader.uniform("position", "vec3", this.position);
		shader.uniform("scale", "vec3", [this._scale, this._scale, this._scale]);
		shader.uniform("uRotation", "float", this.rotation);
		shader.uniform("uFlip", "float", isFlipped ? -1.0 : 1.0);
		shader.uniform("uFogOffset", "float", params.fogOffset);
		shader.uniform("uMaxRange", "float", params.maxRange);
		shader.uniform("uFadeInRange", "float", params.fadeInRange);
		shader.uniform("uTime", "float", params.globalTime);

		// GL.rotate(this._modelMatrix);
		GL.draw(this.mesh);
	}


	setPosition(x, z) {
		this.position = [x, 0, z];
		this.orgPosition = [x, 0, z];
	}

}

export default ViewMountain;
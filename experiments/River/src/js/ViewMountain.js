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
	}


	_init() {
		const NUM = 40;
		const uvGap = 1.0 / NUM;
		const SEED = Math.random();
		const SIZE = 0.5;
		const posOffset = random(3.0, 7.0);
		const power = random(2, 4);
		const HEIGHT = random(.25, .4);
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
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
		this.mesh.bufferNormal(normals);


		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		const grey = 1.00;
		this.time = Math.random();
		this._position = vec3.create();
		this._scale = random(1.0, 4);
		this._modelMatrix = mat4.create();
		this._needUpdate = true;
		this.textureIndex = Math.floor(Math.random() * 35);

	}


	render(textureMountains, isFlipped=false) {
		this.shader.bind();
		
		textureMountains[this.textureIndex].bind(0);

		this.shader.uniform("position", "vec3", this._position);
		this.shader.uniform("scale", "vec3", [this._scale, this._scale, this._scale]);

		this.shader.uniform("uFlip", "float", isFlipped ? -1.0 : 1.0);

		// GL.rotate(this._modelMatrix);
		GL.draw(this.mesh);
	}


	get x() {
		return this._position[0];
	}

	set x(value) {
		this._position[0] = value;
		this._needUpdate = true;
	}

	get y() {
		return this._position[1];
	}

	set y(value) {
		this._position[1] = value;
		this._needUpdate = true;
	}

	get z() {
		return this._position[2];
	}

	set z(value) {
		this._position[2] = value;
		this._needUpdate = true;
	}


	get scale() {
		return this._position[2];
	}

	set scale(value) {
		this._scale = value;
		this._needUpdate = true;
	}

}

export default ViewMountain;
// ViewMountains.js

import alfrid, { GL, TweenNumber } from 'alfrid';
import Perlin from './Perlin';
import vs from '../shaders/mountain.vert';
import fs from '../shaders/mountain.frag';
const random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewMountains extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.meshes = [];
		this._textures = [];

		this.roughness = .95;
		this.specular = .5;
		this.metallic = 0;

		// const f = gui.addFolder('Mountains');
		// f.add(this, 'roughness', 0, 1);
		// f.add(this, 'specular', 0, 1);
		// f.add(this, 'metallic', 0, 1);
		// f.open();
	}


	addMountain(mPosition) {
		const NUM = 24;
		const uvGap = 1.0 / NUM;
		const SEED = Math.random() * 0xFF;
		const SIZE = random(0.5, .7);
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
			let h = Math.max(hx * hy, 0.0);
			h = Math.pow(h, power);
			const x = -SIZE + px * 2.0 * SIZE;
			const z = SIZE - py * 2.0 * SIZE;
			
			const y = h * HEIGHT + Perlin.noise(x*posOffset, z*posOffset, SEED) * NOISE_HEIGHT * h;

			if(isNaN(y)) {
				console.log(x, z, hx * hy);
			}
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

		function getVertexNormal(i, j) {
			const p = getPosition(i, j);
			const pRight = getPosition(i+1, j);
			const pBottom = getPosition(i, j+1);

			const vRight = vec3.create();
			const vBottom = vec3.create();
			vec3.sub(vRight, pRight, p);
			vec3.sub(vBottom, pBottom, p);
			vec3.normalize(vRight, vRight);
			vec3.normalize(vBottom, vBottom);

			const n = vec3.create();
			vec3.cross(n, vRight, vBottom);
			n[1] *= HEIGHT/SIZE;
			vec3.normalize(n, n);
			return n;
		}

		function getNormalGrid(i, j) {
			const pHL = getPosition(i-1, j);
			const pHR = getPosition(i+1, j);
			const pHD = getPosition(i, j-1);
			const pHU = getPosition(i, j+1);

			const n = vec3.create();
			n[0] = pHL[1] - pHR[1];
			n[1] = pHD[1] - pHU[1];
			n[2] = 2.0;

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

				// let n = getNormal(v0, v1, v2);
				// let n = getNormalGrid(i, j);
				normals.push(getVertexNormal(i, j));
				normals.push(getVertexNormal(i+1, j));
				normals.push(getVertexNormal(i+1, j+1));
				normals.push(getVertexNormal(i, j+1));

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

		const mountain = new alfrid.Mesh(GL.TRIANGLES);
		mountain.bufferVertex(positions);
		mountain.bufferTexCoord(coords);
		mountain.bufferIndex(indices);
		mountain.bufferNormal(normals);

		mountain.position = [mPosition[0], mPosition[1] , mPosition[2]];
		mountain.scale = random(2.0, 4);
		mountain.rotation = Math.random() * Math.PI * 2.0;
		mountain.textureIndex = Math.floor(Math.random() * 35);
		mountain.heightOffset = new TweenNumber(0, 'expOut', random(0.005, 0.002));
		setTimeout( () => {
			mountain.heightOffset.value = 1.0;
		}, random(500, 2000));

		if(!this._textures[mountain.textureIndex]) {
			this._textures[mountain.textureIndex] = new alfrid.GLTexture(getAsset('inkDrops'+mountain.textureIndex));
		}

		this.meshes.push(mountain);

		if(this.meshes.length > params.maxNumMountains) {
			this.meshes.shift();
		}

		if(this.meshes.length == params.maxNumMountains) {
			for(let i=0; i<5; i++) {
				this.meshes[i].heightOffset.easing = 'expIn';
				this.meshes[i].heightOffset.value = 0;
			}	
		}
		
		return mountain;
	}


	render(textureRad, textureIrr, textureNoise, mOffset) {
		this.shader.bind();
		this.shader.uniform('uNoiseMap', 'uniform1i', 1);
		this.shader.uniform('uRadianceMap', 'uniform1i', 2);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 3);

		textureNoise.bind(1);
		textureRad.bind(2);
		textureIrr.bind(3);

		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		this.shader.uniform('texture', 'uniform1i', 0);
		this.shader.uniform("uFogOffset", "float", params.fogOffset);
		this.shader.uniform("uMaxRange", "float", params.maxRange);
		this.shader.uniform("uFadeInRange", "float", params.fadeInRange);
		this.shader.uniform("uOffset", "float", mOffset);

		this.meshes.map((m)=> {
			this._textures[m.textureIndex].bind(0);
			this.shader.uniform("uPosition", "vec3", m.position);
			this.shader.uniform("uScale", "vec3", [m.scale, m.scale, m.scale]);
			this.shader.uniform("uRotation", "float", m.rotation);
			this.shader.uniform("uHeightOffset", "float", m.heightOffset.value);
			GL.draw(m);
		});
		// GL.draw(this.meshes);
	}


	get positions() {
		return this.meshes.map( m => m.position);
	}

}

export default ViewMountains;
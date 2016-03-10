// ViewMountain.js

import alfrid from './libs/alfrid.js';

let SimplexNoise = require('simplex-noise');
let glslify      = require("glslify");
let GL           = alfrid.GL;

class ViewMountain extends alfrid.View {
	
	constructor() {
		super(glslify('../shaders/pbr.vert'), glslify('../shaders/pbr.frag'));
	}


	_init() {
		var positions = [];
		var normals = [];
		var coords = [];
		var indices = []; 

		let simplex = new SimplexNoise();
		let size = 15;
		let height = 2.5;
		let num = 100;
		let count = 0;
		const noiseOffset = Math.random() * 1000;

		function getPos(i, j) {

			const posOffset = 0.15;
			let x = i/num * size - size / 2;
			let z = j/num * size - size / 2;
			let y = simplex.noise2D(x*posOffset+noiseOffset, z*posOffset+noiseOffset) + 1.0;

			let px = Math.sin(i/num*Math.PI);
			let py = Math.sin(j/num*Math.PI);
			y *= Math.pow(px * py, 2.0) * height;
			y -= 3.0;

			let pos = [x, y, z];
			return pos;
		}

		function getNormal(i, j) {
			let normal 	= vec3.create(), 
				v0      = vec3.create(), 
				v1      = vec3.create();
			let p = vec3.clone(getPos(i, j));
			let p0 = vec3.clone(getPos(i+1, j));
			let p1 = vec3.clone(getPos(i, j+1));

			vec3.sub(v0, p0, p);
			vec3.sub(v1, p1, p);
			vec3.cross(normal, v1, v0);

			return normal;
		}

		for(let j=0; j<num; j++) {
			for(let i=0; i<num; i++) {
				positions.push(getPos(i, j+1));
				positions.push(getPos(i+1, j+1));
				positions.push(getPos(i+1, j));
				positions.push(getPos(i, j));

				coords.push([i/num, (j+1)/num]);
				coords.push([(i+1)/num, (j+1)/num]);
				coords.push([(i+1)/num, j/num]);
				coords.push([i/num, j/num]);

				normals.push(getNormal(i, j+1));
				normals.push(getNormal(i+1, j+1));
				normals.push(getNormal(i+1, j));
				normals.push(getNormal(i, j));

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);

				count ++;
			}
		}


		this.mesh = new alfrid.Mesh(GL.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferIndices(indices);
	}


	render(textureRad, textureIrr, textureAO, textureDetail, textureNoise) {
		this.shader.bind();
		this.shader.uniform("uAoMap", "uniform1i", 0);
		this.shader.uniform("textureDetail", "uniform1i", 1);
		this.shader.uniform("textureNoise", "uniform1i", 2);
		this.shader.uniform("uRadianceMap", "uniform1i", 3);
		this.shader.uniform("uIrradianceMap", "uniform1i", 4);
		textureAO.bind(0);
		textureDetail.bind(1);
		textureNoise.bind(2);
		textureRad.bind(3);
		textureIrr.bind(4);

		let roughness4 = Math.pow(params.roughness, 4.0);
		this.shader.uniform("uBaseColor", "uniform3fv", [1, 1, 1]);
		this.shader.uniform("uRoughness", "uniform1f", params.roughness);
		this.shader.uniform("uRoughness4", "uniform1f", roughness4);
		this.shader.uniform("uMetallic", "uniform1f", params.metallic);
		this.shader.uniform("uSpecular", "uniform1f", params.specular);

		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);
		GL.draw(this.mesh);
	}


}

export default ViewMountain;
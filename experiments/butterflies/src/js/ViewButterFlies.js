// ViewButterFlies.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/butterflies.vert';
import fs from '../shaders/butterflies.frag';

const random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewButterFlies extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		const num = 5 * 2;
		this.mesh = new alfrid.Mesh();
		this._texture = new alfrid.GLTexture(getAsset('butterfly'));

		const positions = [];
		const uvs = [];
		const indices = [];
		const normals = [];
		const size = .25;
		let count = 0;
		const sx = -size/2;
		const sz = size/2;
		const gap = size / num;

		let z;


		for(let i=0; i<num; i++) {
			//	left wing
			z = sz - i * gap;
			positions.push([sx, 0, z]);
			positions.push([0, 0, z]);
			positions.push([0, 0, z-gap]);
			positions.push([sx, 0, z-gap]);

			uvs.push([0, i/num]);
			uvs.push([0.5, i/num]);
			uvs.push([0.5, (i+1)/num]);
			uvs.push([0, (i+1)/num]);

			normals.push([0, 1, 0]);
			normals.push([0, 1, 0]);
			normals.push([0, 1, 0]);
			normals.push([0, 1, 0]);

			indices.push(count*4 + 0);
			indices.push(count*4 + 1);
			indices.push(count*4 + 2);
			indices.push(count*4 + 0);
			indices.push(count*4 + 2);
			indices.push(count*4 + 3);

			count ++;

			//	right wing
			z = sz - i * gap;
			positions.push([0, 0, z]);
			positions.push([-sx, 0, z]);
			positions.push([-sx, 0, z-gap]);
			positions.push([0, 0, z-gap]);

			normals.push([0, 1, 0]);
			normals.push([0, 1, 0]);
			normals.push([0, 1, 0]);
			normals.push([0, 1, 0]);

			uvs.push([0.5, i/num]);
			uvs.push([1, i/num]);
			uvs.push([1, (i+1)/num]);
			uvs.push([0.5, (i+1)/num]);

			indices.push(count*4 + 0);
			indices.push(count*4 + 1);
			indices.push(count*4 + 2);
			indices.push(count*4 + 0);
			indices.push(count*4 + 2);
			indices.push(count*4 + 3);

			count ++;
		}

		const { numParticles } = params;
		const uvPositions = [];
		const extras = [];
		const colors = [];

		for(let i=0; i<numParticles; i++) {
			for(let j=0; j<numParticles; j++) {
				uvPositions.push([i/numParticles, j/numParticles]);
				extras.push([random(.8, 2.2), Math.random() * 10.0, Math.random()]);
				colors.push([random(.8, 1.0), random(.8, 1.0), random(.8, 1)]);
			}
		}


		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);
		this.mesh.bufferNormal(normals);

		this.mesh.bufferInstance(uvPositions, 'aUVPosition');
		this.mesh.bufferInstance(extras, 'aExtra');
		this.mesh.bufferInstance(colors, 'aColor');
	}


	render(textureCurr, textureNext, p) {
		this.time += 0.1;
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 2);
		this._texture.bind(2);

		this.shader.uniform('textureCurr', 'uniform1i', 0);
		textureCurr.bind(0);

		this.shader.uniform('textureNext', 'uniform1i', 1);
		textureNext.bind(1);

		this.shader.uniform('percent', 'float', p);

		this.shader.uniform("uLightPosition", "vec3", params.lightPosition);

		this.shader.uniform("uTime", "float", this.time);
		GL.draw(this.mesh);
	}


}

export default ViewButterFlies;
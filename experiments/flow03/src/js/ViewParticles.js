// ViewParticles.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/particles.vert';
import fs from 'shaders/particles.frag';

class ViewParticles extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {

		const positions = [];
		const normals = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const { numParticles, floorSize } = Config;
		const s = -floorSize/2;

		const startRadius = 0.2;
		const endRadius = 1.5;
		const gap = 0.01;
		const org = vec3.create();
		this.gap = gap;

		for(let r=startRadius; r<endRadius; r+=gap) {
			const l = 2 * Math.PI * r;
			const numDots = Math.floor(l / gap);

			for(let i=0; i<numDots; i++) {
				let v = vec3.fromValues(r, 0, 0);
				let a = i/numDots * Math.PI * 2;
				
				vec3.rotateY(v, v, org, a);

				let _u = v[0]/endRadius * .5 + .5;
				let _v = v[2]/endRadius * .5 + .5;

				positions.push(v);
				uvs.push([_u, _v]);
				normals.push([Math.random(), Math.random(), Math.random()]);
				indices.push(count);
				count++;
			}
		}


/*

		for(let i=0; i<numParticles; i++) {
			for(let j=0; j<numParticles; j++) {
				let x = s + i/numParticles * floorSize;
				let z = s + j/numParticles * floorSize;
				positions.push([x, 0, z]);
				uvs.push([i/numParticles, j/numParticles]);
				normals.push([Math.random(), Math.random(), Math.random()]);
				indices.push(count);
				count ++;
			}
		}
*/

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferIndex(indices);

		this.count = 0;
		this.interval = 100;
	}


	render(textureMap, textureParticle) {
		this.count ++;
		if(this.count > this.interval) {
			this.count = 0;
		}
		this.shader.bind();
		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform("textureMap", "uniform1i", 0);
		this.shader.uniform("uGap", "float", this.gap);
		textureMap.bind(0);
		this.shader.uniform("textureParticle", "uniform1i", 1);
		textureParticle.bind(1);

		let p = this.count/this.interval
		this.shader.uniform("uPercent", "float", 0);
		GL.draw(this.mesh);

	}


}

export default ViewParticles;
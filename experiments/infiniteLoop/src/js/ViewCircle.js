// ViewCircle.js

import alfrid, { GL } from 'alfrid';
const vs = require('../shaders/pbr.vert');
const fs = require('../shaders/pbr.frag');

class ViewCircle extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const numSeg = 24*150;
		const radius = 1;
		const size = .1;

		const positions = [];
		const uvs = [];
		const indices = [];
		const normals = [];
		let count = 0;
		let theta;

		const scale = 0.05;
		const front 	= [0, -size * scale, -size];
		const top 		= [0,  size * scale, -size];
		const back 		= [0,  size * scale, size];
		const bottom 	= [0, -size * scale, size];
		const m = mat4.create();

		const _front = vec3.create();
		const _top = vec3.create();
		const _back = vec3.create();
		const _bottom = vec3.create();

		function getRing(i, num) {
			theta = i/num * Math.PI * 2.0;
			let thetaX = Math.pow(i/num, 5) * Math.PI;
			mat4.identity(m);
			
			mat4.rotateZ(m, m, theta-Math.PI/2);
			mat4.rotateX(m, m, thetaX);
			// mat4.rotateX(m, m, thetaX-Math.PI/4);
			
			let cx = Math.cos(theta) * radius;
			let cy = Math.sin(theta) * radius;

			vec3.transformMat4(_front, front, m);
			vec3.transformMat4(_top, top, m);
			vec3.transformMat4(_back, back, m);
			vec3.transformMat4(_bottom, bottom, m);

			let p0 = [cx+_front[0], cy+_front[1], _front[2]];
			let p1 = [cx+_top[0], cy+_top[1], _top[2]];
			let p2 = [cx+_back[0], cy+_back[1], _back[2]];
			let p3 = [cx+_bottom[0], cy+_bottom[1], _bottom[2]];
			let pCenter = [cx, cy, 0];

			return [p0, p1, p2, p3, pCenter];
		}


		const rings = [];

		for(let i=0; i<numSeg; i++) {
			let ring = getRing(i, numSeg);
			rings.push(ring);
		}


		function getFaceNormal(a, b, c) {
			const ba = vec3.create();
			const ca = vec3.create();
			const n = vec3.create();
			vec3.sub(ba, b, a);
			vec3.sub(ca, c, a);
			vec3.cross(n, ba, ca);
			vec3.normalize(n, n);
			return n;
		}


		function getNormal(p, c) {
			let n = vec3.create();
			vec3.sub(n, p, c);
			vec3.normalize(n, n);
			return n;
		}


		for(let i=0; i<rings.length; i++) {
			let curr = rings[i];
			let nextIndex = i == rings.length-1 ? 0 : i+1;
			let next = rings[nextIndex];

			let front0 = curr[0];
			let front1 = next[0];
			let top0 = curr[1];
			let top1 = next[1];
			let back0 = curr[2];
			let back1 = next[2];
			let bottom0 = curr[3];
			let bottom1 = next[3];

			let uv = i/rings.length;


			for(let j=0; j<4; j++) {
				let ni = j == 3 ? 0 : j + 1;
				let p0 = curr[j];
				let p1 = next[j];
				let p2 = next[ni];
				let p3 = curr[ni];

				positions.push(p0);
				positions.push(p1);
				positions.push(p2);
				positions.push(p3);

				uvs.push([uv, uv]);
				uvs.push([uv, uv]);
				uvs.push([uv, uv]);
				uvs.push([uv, uv]);

				let faceNormal = getFaceNormal(p0, p1, p3);

				// normals.push(getNormal(p0, curr[4]));
				// normals.push(getNormal(p1, next[4]));
				// normals.push(getNormal(p2, curr[4]));
				// normals.push(getNormal(p3, curr[4]));

				normals.push(faceNormal);
				normals.push(faceNormal);
				normals.push(faceNormal);
				normals.push(faceNormal);

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);

				count++;
			}
			
		}


		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferIndex(indices);

		this.roughness = .9;
		this.specular = 1;
		this.metallic = 1;
		this.baseColor = [1, 1, 1];
		
		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);
	}


	render(textureRad, textureIrr) {
		this.shader.bind();

		this.shader.uniform('uRadianceMap', 'uniform1i', 0);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 1);
		textureRad.bind(0);
		textureIrr.bind(1);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);

		GL.draw(this.mesh);
	}


}

export default ViewCircle;
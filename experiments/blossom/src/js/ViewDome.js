// ViewDome.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
const vs = require('../shaders/dome.vert');
const fs = require('../shaders/dome.frag');


class ViewDome extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random();
		this.waveFront = new alfrid.EaseNumber(params.domeRadius * 2.0 + 3, 0.0075);
		this.waveLength = 1.;
		

		// gui.add(this.waveFront, 'value', -1, params.domeRadius * 2.0 + 3).listen();
	}


	_init() {
		let positions = [];
		let coords = [];
		let indices = [];
		let normals = [];
		let centers = [];
		let count = 0;
		const num = 60;
		const uvGap = 1/num;


		function getPosition(i, j) {
			let pos = [0, 0, 0];
			let ry = i/num * Math.PI * 2.0;
			let rx = j/num * Math.PI - Math.PI/2;

			pos[1] = Math.sin(rx) * params.domeRadius;
			let r = Math.cos(rx) * params.domeRadius;
			pos[0] = Math.cos(ry) * r;
			pos[2] = Math.sin(ry) * r;

			return pos;
		}

		function getNormal(p0, p1, p2) {
			let pp0 = vec3.clone(p0);
			let pp1 = vec3.clone(p1);
			let pp2 = vec3.clone(p2);
			let v0 = vec3.create();
			let v1 = vec3.create();
			let n = vec3.create();

			vec3.sub(v0, pp1, pp0);
			vec3.sub(v1, pp2, pp0);

			vec3.cross(n, v1, v0);
			vec3.normalize(n, n);

			return n;
		}

		function getCenter(p0, p1) {
			return [
				(p0[0] + p1[0])/2, 
				(p0[1] + p1[1])/2, 
				(p0[2] + p1[2])/2 
			]
		}


		for(let j=0; j<num; j++) {
			for(let i=0; i<num; i++) {
				let v0 = getPosition(i, j);
				let v1 = getPosition(i+1, j);
				let v2 = getPosition(i+1, j+1);
				let v3 = getPosition(i, j+1);
				let n = getNormal(v0, v1, v3);
				let c = getCenter(v0, v2);

				positions.push(v0);
				positions.push(v1);
				positions.push(v2);
				positions.push(v3);

				normals.push(n);
				normals.push(n);
				normals.push(n);
				normals.push(n);

				centers.push(c);
				centers.push(c);
				centers.push(c);
				centers.push(c);

				coords.push([i/num, j/num]);
				coords.push([i/num+uvGap, j/num]);
				coords.push([i/num+uvGap, j/num+uvGap]);
				coords.push([i/num, j/num+uvGap]);

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
		this.mesh.bufferIndices(indices);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferData(centers, 'aCenter', 3);

		
		this.startPosition = [0, params.domeRadius, -1];

		this.shader.bind();
		this.shader.uniform("startPosition", "vec3", this.startPosition);
		this.shader.uniform("textureCurr", "uniform1i", 0);
		this.shader.uniform("textureNext", "uniform1i", 1);
	}

	open(startPosition=[1, params.domeRadius, 0]) {
		console.log('Open');
		this.time = Math.random();
		this.startPosition = startPosition;
		this.waveFront.setTo(-1);
		this.waveFront.value = params.domeRadius * 2.0 + 3;
		this.shader.bind();
		this.shader.uniform("startPosition", "vec3", this.startPosition);
	}


	render(textureCurr, textureNext) {

		let p = this.waveFront.value / params.domeRadius / 2.0;
		if(p < 0) p = 0;
		if(p > 1) p = 1;

		params.offset = p;

		this.shader.bind();
		this.shader.uniform("time", "float", this.time);
		this.shader.uniform("waveFront", "float", this.waveFront.value);
		this.shader.uniform("waveLength", "float", this.waveLength);
		textureCurr.bind(0);
		textureNext.bind(1);
		GL.draw(this.mesh);
	}


}

export default ViewDome;
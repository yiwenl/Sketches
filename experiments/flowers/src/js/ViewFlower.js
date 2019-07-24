// ViewFlower.js

import alfrid, { GL } from 'alfrid';

import Assets from './Assets';

import vs from 'shaders/flower.vert';
import fs from 'shaders/flower.frag';

class ViewFlower extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const meshSphere = Assets.get('sphere');
		const { vertices } = meshSphere;

		const positions = [];
		const normals = [];
		const centers = [];
		const nexts = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const getNextIndex = (i) => {
			if(i === 2) {
				return 0;
			} else {
				return i + 1;
			}
		}

		const getCenter = (a, b, c) => {
			return [
				(a[0] + b[0] + c[0])/3,
				(a[1] + b[1] + c[1])/3,
				(a[2] + b[2] + c[2])/3
			]
		}

		let points;
		for(let i=0; i<vertices.length; i+=3) {
			let a = vertices[i];
			let b = vertices[i+1];
			let c = vertices[i+2];
			points = [a, b, c];

			let center = getCenter(a, b, c);

			for(let i=0; i<3; i++) {
				positions.push(center);
				positions.push(points[i]);
				positions.push(points[getNextIndex(i)]);

				uvs.push([1, 0]);
				uvs.push([0, 1]);
				uvs.push([0, 1]);

				centers.push(center);
				centers.push(center);
				centers.push(center);

				normals.push(points[i]);
				normals.push(points[i]);
				normals.push(points[i]);

				nexts.push(points[getNextIndex(i)]);
				nexts.push(points[getNextIndex(i)]);
				nexts.push(points[getNextIndex(i)]);

				indices.push(count);
				indices.push(count+1);
				indices.push(count+2);

				count += 3;
			}
		}

		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferNormal(normals);
		this.mesh.bufferData(centers, 'aCenter');
		this.mesh.bufferData(nexts, 'aNext');
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

		this.offset = new alfrid.EaseNumber(0.1, 0.05);
		setTimeout(()=> {
			gui.add(this.offset, 'value', 0, 1).name('Offset');
		}, 500);
	}


	render() {
		GL.disable(GL.CULL_FACE);
		this.shader.bind();
		this.shader.uniform("uOffset", "float", this.offset.value);
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime * 0.5);
		GL.draw(this.mesh);
		GL.enable(GL.CULL_FACE);
	}


}

export default ViewFlower;
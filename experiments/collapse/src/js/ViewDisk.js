// ViewDisk.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from 'shaders/disk.vert';
import fs from 'shaders/disk.frag';

class ViewDisk extends alfrid.View {
	
	constructor() {
		super(vs, fs);


		this.offset = 0.;

		setTimeout(()=> {
			gui.add(this, 'offset', 0.0, 0.5);
		}, 500);
	}


	_init() {

		const positions = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const num = 24 * 2;
		const numCircles = 5;
		const startingRadius = .5;
		const circleSize = .5;
		this.totalSize = startingRadius + circleSize * numCircles;


		const getPos = (i, j, z) => {
			let r = startingRadius + j * circleSize;
			let a = -i / num * Math.PI * 2.0;
			return [
				Math.cos(a) * r,
				Math.sin(a) * r,
				z * circleSize
			]
		}

		for(let i=0; i<num; i++) {
			for(let j=0; j<numCircles; j++) {


				//	flat
				positions.push(getPos(i, j, j));
				positions.push(getPos(i+1, j, j));
				positions.push(getPos(i+1, j+1, j));
				positions.push(getPos(i, j+1, j));

				uvs.push([numCircles - j - 1, 0]);
				uvs.push([numCircles - j - 1, 0]);
				uvs.push([numCircles - j - 1, 0]);
				uvs.push([numCircles - j - 1, 0]);

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);

				count ++;


				//	wall
				positions.push(getPos(i, j, j-1));
				positions.push(getPos(i+1, j, j-1));
				positions.push(getPos(i+1, j, j));
				positions.push(getPos(i, j, j));

				uvs.push([numCircles - j, 0]);
				uvs.push([numCircles - j, 0]);
				uvs.push([numCircles - j-1, 0]);
				uvs.push([numCircles - j-1, 0]);

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);

				count ++;
			}
		}

		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);


		this.texture = Assets.get('map');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uOffset", "float", this.offset);
		this.shader.uniform("uTotalSize", "float", this.totalSize);
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewDisk;
// ViewCylinder.js


import alfrid, { GL } from 'alfrid';
import Config from './Config';

class ViewCylinder extends alfrid.View {
	
	constructor() {
		super();
	}


	_init() {
		const { range, maxRadius } = Config;
		const positions = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const num = 24;
		const radius = maxRadius * 0.9;


		const getPos = (i, j) => {
			let x = -range + i/num * range * 2;
			let a = j/num * Math.PI - Math.PI/2;
			let y = Math.sin(a) * radius;
			let z = Math.cos(a) * radius;

			return [x, y, z];
		}

		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				positions.push(getPos(i, j));
				positions.push(getPos(i+1, j));
				positions.push(getPos(i+1, j+1));
				positions.push(getPos(i, j+1));

				uvs.push([i/num, j/num]);
				uvs.push([(i+1)/num, j/num]);
				uvs.push([(i+1)/num, (j+1)/num]);
				uvs.push([i/num, (j+1)/num]);

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);

				count ++;
			}
		}


		// this.mesh = new alfrid.Mesh();
		// this.mesh.bufferVertex(positions);
		// this.mesh.bufferTexCoord(uvs);
		// this.mesh.bufferIndex(indices);

		this.mesh = alfrid.Geom.plane(range * 3, maxRadius * 4.0, 1, 'xy');
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewCylinder;
// ViewPillar.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';

class ViewPillar extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const { pillarRadius, pillarHeight } = Config;
		console.log(pillarRadius, pillarHeight);

		const num = 24;
		const positions = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const getPos = (i, j) => {
			const a = -i/num * Math.PI * 2.0;
			let x = Math.cos(a) * pillarRadius;
			let z = Math.sin(a) * pillarRadius;
			let y = (j - 0.5) * pillarHeight * 2.0;

			return [x, y, z];
		}

		for(let i=0; i<num; i++) {
			positions.push(getPos(i, 0));
			positions.push(getPos((i+1), 0));
			positions.push(getPos((i+1), 1));
			positions.push(getPos(i, 1));

			uvs.push([i/num, 0]);
			uvs.push([(i+1)/num, 0]);
			uvs.push([(i+1)/num, 1]);
			uvs.push([i/num, 1]);

			indices.push(count * 4 + 0);
			indices.push(count * 4 + 1);
			indices.push(count * 4 + 2);
			indices.push(count * 4 + 0);
			indices.push(count * 4 + 2);
			indices.push(count * 4 + 3);

			count ++;
		}


		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

		let g = 0.00;
		this.shader.bind();
		this.shader.uniform("color", "vec3", [g, g, g]);
		this.shader.uniform("opacity", "float", 1);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewPillar;
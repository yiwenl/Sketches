// ViewLines.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/lines.vert';

class ViewLines extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const positions = [];
		const uv = [];
		const indices = [];

		const r = 1000;
		let count = 0;
		

		const num = 30;
		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				positions.push([-r, -num/2+j, 0]);
				positions.push([r, -num/2+j, 0]);

				indices.push(count);
				indices.push(count+1);

				uv.push([0, 0])
				uv.push([0, 0])

				count += 2;


				positions.push([-num/2+i, -r, 0]);
				positions.push([-num/2+i, r, 0]);

				indices.push(count);
				indices.push(count+1);

				uv.push([0, 0])
				uv.push([0, 0])

				count += 2;

				positions.push([0, -num/2+i, -r]);
				positions.push([0, -num/2+i, r]);

				indices.push(count);
				indices.push(count+1);

				uv.push([0, 0])
				uv.push([0, 0])

				count += 2;
			}
		}

		this.mesh = new alfrid.Mesh(GL.LINES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uv);
		this.mesh.bufferIndex(indices);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("color", "vec3", [0, 0, 0]);
		this.shader.uniform("opacity", "float", .25);
		GL.draw(this.mesh);
	}


}

export default ViewLines;
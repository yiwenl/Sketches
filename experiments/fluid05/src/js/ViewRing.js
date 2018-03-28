// ViewRing.js


import alfrid, { GL } from 'alfrid';
import vs from 'shaders/ring.vert';
import fs from 'shaders/ring.frag';
import Config from './Config';

class ViewRing extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = new alfrid.Mesh();

		const positions = [];
		const uvs = [];
		const indices = [];
		const numX = 100;
		const numY = numX / 2;
		let count = 0;
		const radius = 30;
		const l = Math.PI * 2 * radius;
		const ratio = Config.TEXTURE_WIDTH / Config.TEXTURE_HEIGHT;
		const height = l / ratio;


		const getPos = (i, j) => {
			let a = i/numX * Math.PI * 2.0;
			let x = Math.cos(a) * radius;
			let z = Math.sin(a) * radius;

			let y = -height/2 + height * j/numY;
			return [x, y, z];
		}


		for(let i=0; i<numX; i++) {
			for(let j=0; j<numY; j++) {
				positions.push(getPos(i, j));
				positions.push(getPos(i + 1, j));
				positions.push(getPos(i + 1, j + 1));
				positions.push(getPos(i, j + 1));

				uvs.push([i/numX, j/numY]);
				uvs.push([(i+1)/numX, j/numY]);
				uvs.push([(i+1)/numX, (j+1)/numY]);
				uvs.push([i/numX, (j+1)/numY]);

				indices.push(count * 4 + 0);
				indices.push(count * 4 + 1);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 0);
				indices.push(count * 4 + 2);
				indices.push(count * 4 + 3);

				count ++;
			}
		}

		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);
		
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewRing;
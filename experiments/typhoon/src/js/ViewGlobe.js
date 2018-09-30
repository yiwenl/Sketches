// ViewGlobe.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import Assets from './Assets';
import vs from 'shaders/globe.vert';
import fs from 'shaders/globe.frag';

class ViewGlobe extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { num } = Config;
		const numX = num;
		const numY = num/2;

		const positions = [];
		const uvs = [];
		const indices = [];
		let index = 0;

		for(let i=0; i<numX; i++) {
			for(let j=0; j<numY; j++) {
				positions.push([i, j, 0]);
				positions.push([i+1, j, 0]);
				positions.push([i+1, j+1, 0]);
				positions.push([i, j+1, 0]);

				uvs.push([i/numX, j/numY]);
				uvs.push([(i+1)/numX, j/numY]);
				uvs.push([(i+1)/numX, (j+1)/numY]);
				uvs.push([i/numX, (j+1)/numY]);

				indices.push(index * 4 + 0);
				indices.push(index * 4 + 1);
				indices.push(index * 4 + 2);
				indices.push(index * 4 + 0);
				indices.push(index * 4 + 2);
				indices.push(index * 4 + 3);

				index ++;
			}
		}

		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

		this.texture = Assets.get('earth');
		this.texture.minFilter = this.texture.magFilter = GL.NEAREST;
	}


	render(offset) {
		this.shader.bind();
		this.shader.uniform("uNum", "float", Config.num);
		this.shader.uniform("uSize", "float", Config.size);
		this.shader.uniform("uRadius", "float", Config.radius);
		this.shader.uniform("uOffset", "float", offset);
		this.shader.uniform("uShift", "float", Config.shift);

		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		
		GL.draw(this.mesh);
	}


}

export default ViewGlobe;
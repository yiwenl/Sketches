// ViewDots.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/dots.vert';
import fs from '../shaders/dots.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

const NUM = 256;

class ViewDots extends alfrid.View {
	
	constructor() {
		super(vs,  fs);
	}


	_init() {
		const positions = [];
		const extra = [];
		const coords = [];
		const indices = [];
		const range = 0.75;
		let count = 0;

		for(let j=0; j<NUM; j++) {
			for(let i=0; i<NUM; i++) {
				positions.push([i+random(-range, range), Math.random(), j+random(-range, range)]);
				// extra.push([Math.random(), Math.random(), Math.random()]);
				coords.push([i/NUM, j/NUM]);
				indices.push(count);
				count ++;
			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);
		// this.mesh.bufferData('aExtra', extra, 3);

		this.scale = 0.02;
		this.dotSize = 0.0025;
		gui.add(this, 'scale', 0.01, 0.05);
		gui.add(this, 'dotSize', 0.0005, 0.02);
	}


	render(texture, uvOffset, num, textureNormal, textureLight) {
		let pos = [0, 0, 0];
		let totalsize = NUM * this.scale;
		// console.log(uvOffset);
		pos[0] = uvOffset[0] * NUM * num - NUM * num/2;
		pos[2] = uvOffset[1] * NUM * num - NUM * num/2;
		// pos[0] = -this.scale * NUM/2 + uvOffset[0] * this.scale * NUM;
		// pos[2] = -this.scale * NUM/2 + uvOffset[1] * this.scale * NUM;

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureNormal", "uniform1i", 1);
		textureNormal.bind(1);
		this.shader.uniform("textureLight", "uniform1i", 2);
		textureLight.bind(2);
		this.shader.uniform("uvOffset", "vec2", uvOffset);
		this.shader.uniform("scale", "vec3", [this.scale, 1, this.scale * 2]);
		this.shader.uniform("numSeg", "float", num);

		this.shader.uniform("radius", "float", this.dotSize);
		this.shader.uniform("uPosition", "vec3", pos);
		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		GL.draw(this.mesh);
	}


}

export default ViewDots;
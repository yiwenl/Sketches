// ViewPixels.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/pixels.vert';
import fs from 'shaders/pixels.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}


class ViewPixels extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = new alfrid.Mesh(GL.POINTS);

		const positions = [];
		const uvs = [];
		const indices = [];
		let count = 0;

		const num = 500000;
		const ir = 2.5;
		const or = 8;
		let i = num;
		const { abs } = Math;

		const checkPos = (value) => {
			// if(abs(value[0]) < ir) return true;
			// else if(abs(value[1]) < ir) return true;
			// else if(abs(value[2]) < ir) return true;

			if(abs(value[0]) < ir && abs(value[1]) < ir && abs(value[2]) < ir) return true;
			else return false;
		}

		const getPos = () => {
			

			let v = vec3.create();
			do {
				vec3.set(
					v, 
					random(-or, or), 
					random(-or, or), 
					random(-or, or)
				);
			} while( checkPos(v) );

			return v;
		}


		while(i--) {
			positions.push(getPos());
			uvs.push([Math.random(), Math.random()]);

			indices.push(count);
			count ++;
		}

		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(uvs);
		this.mesh.bufferIndex(indices);

	}


	render(texture, cameraPos) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform('uViewport', 'vec2', [GL.width, GL.height]);
		this.shader.uniform("uCameraPos", "vec3", cameraPos);
		GL.draw(this.mesh);
	}


}

export default ViewPixels;
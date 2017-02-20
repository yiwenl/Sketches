// ViewStars.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from '../shaders/sky.vert';
import fs from '../shaders/tile.frag';


const Y_SCALE = 3;

class ViewStars extends alfrid.View {
	
	constructor() {
		super(null, fs);
	}


	_init() {

		const positions = [];
		const coords = [];
		const indices = [];
		let index = 0;

		const num = 24;
		const r = 70;
		const h = 20 * Y_SCALE;

		const getPosition = function(i, j) {
			let a = i/num * Math.PI * 2.0;
			let x = Math.cos(a) * r;
			let y = j == 0 ? -h : h;
			let z = Math.sin(a) * r;
			return [x, y, z];
		}

		for(let i=0; i<num; i++) {
			for(let j=0; j<2; j++) {
				positions.push(getPosition(i, j));
				positions.push(getPosition(i+1, j));
				positions.push(getPosition(i+1, j+1));
				positions.push(getPosition(i, j+1));

				coords.push([i/num, 0]);
				coords.push([(i+1)/num, 0]);
				coords.push([(i+1)/num, 1]);
				coords.push([i/num, 1]);

				indices.push(index*4 + 0);
				indices.push(index*4 + 1);
				indices.push(index*4 + 2);
				indices.push(index*4 + 0);
				indices.push(index*4 + 2);
				indices.push(index*4 + 3);

				index++;
			}
		}

		this.mesh = new alfrid.Mesh();
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoord(coords);
		this.mesh.bufferIndex(indices);


	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		Assets.get('stars').bind(0);
		this.shader.uniform("uUVScale", "vec2", [5, Y_SCALE]);
		// GL.disable(GL.CULL_FACE);
		GL.draw(this.mesh);
	}


}

export default ViewStars;
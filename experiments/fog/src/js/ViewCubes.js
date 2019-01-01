// ViewCubes.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cube.vert';
import fs from 'shaders/diffuse.frag';

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = .1;
		const num = 50;
		const positions = [];
		const start = -num * s * 0.5;

		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				for(let k=0; k<num; k++) {
					positions.push([
						start + i * s,
						start + j * s,
						start + k * s
					])
				}
			}
		}


		this.mesh = alfrid.Geom.cube(s * 0.9, s * 0.9, s * 0.9);
		this.mesh.bufferInstance(positions, 'aPosOffset');
	}


	render(mOrigin, mDir) {
		this.shader.bind();
		this.shader.uniform("uOrigin", "vec3", mOrigin);
		this.shader.uniform("uDir", "vec3", mDir);
		GL.draw(this.mesh);
	}


}

export default ViewCubes;
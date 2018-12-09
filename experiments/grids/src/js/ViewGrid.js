// ViewGrid.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/grids.vert';
import fs from 'shaders/grids.frag';

class ViewGrid extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {

		const positions = [];
		const posOffset = [];
		const indices = [];
		let count = 0;

		let s = 1;

		const numSides = Config.numPoly;

		const addLine = (a, b) => {
			positions.push(a, b);
			indices.push(count, count + 1);
			count += 2;
		}

		const addSide = (a, b) => {
			let a0 = a / numSides * Math.PI * 2.0 + Math.PI/4;
			let a1 = b / numSides * Math.PI * 2.0 + Math.PI/4;

			let pa = [Math.cos(a0) * s, 0, Math.sin(a0) * s];
			let pb = [Math.cos(a1) * s, 0, Math.sin(a1) * s];

			addLine(pa, pb);
		}

		for(let i=0; i<numSides; i++) {
			addSide(i, i+1);
		}


		const num = 20;

		for(let i=0; i < num; i++) {
			for(let j=0; j < num; j++) {
				let x = (i - num/2) * s * 2;
				let z = (j - num/2) * s * 2;
				posOffset.push([x, 0, z]);
			}
		}


		// addLine([-s, 0, -s], [ s, 0, -s]);
		// addLine([ s, 0, -s], [ s, 0,  s]);
		// addLine([ s, 0,  s], [-s, 0,  s]);
		// addLine([-s, 0,  s], [-s, 0, -s]);

		this.mesh = new alfrid.Mesh(GL.LINES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);
		this.mesh.bufferInstance(posOffset, 'aPosOffset');



		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 1, 1]);
		this.shader.uniform("opacity", "float", 1);
	}


	render(mOffset=0) {
		this.shader.bind();
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime * 0.5 * Config.speed);
		this.shader.uniform("uOffset", "float", mOffset);
		this.shader.uniform("uNoise", "float", Config.noise);
		GL.draw(this.mesh);
	}


}

export default ViewGrid;
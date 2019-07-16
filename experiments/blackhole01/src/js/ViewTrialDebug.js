// ViewTrialDebug.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/trailDebug.vert';
import fs from 'shaders/trailDebug.frag';

class ViewTrialDebug extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const { numTrails } = Config;
		const positions = [];
		let indices      = []; 
		let count        = 0;

		let ux, uy;

		for(let j = 0; j < numTrails; j++) {
			for(let i = 0; i < numTrails; i++) {
				ux = i / numTrails;
				uy = j / numTrails;
				positions.push([ux, uy, 0]);
				indices.push(count);
				count ++;

			}
		}

		this.mesh = new alfrid.Mesh(GL.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferIndex(indices);
	}


	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewTrialDebug;
// ViewCubes.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/cubes.vert';
import fs from '../shaders/cubes.frag';
import Assets from './Assets';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.cube(1, 1, 1);

		const numCubes = params.numCubes;
		const positions = [];
		const extras = [];
		const r = 10;
		for(let i=0; i<numCubes; i++) {
			positions.push([random(-r, r), random(-r, r), random(-r, r)]);
			let scale = random(.05, .1);
			let rx = Math.random() * Math.PI * 2.0;
			let ry = Math.random() * Math.PI * 2.0;

			extras.push([rx, ry, scale]);
		}

		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(extras, 'aExtras');
	}


	render(positions, extras, scale = 1) {
		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(extras, 'aExtras');

		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uScale", "float", scale);
		Assets.get('bg').bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewCubes;
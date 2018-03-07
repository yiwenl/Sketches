// ViewCubes.js

import alfrid, { GL } from 'alfrid';

import vs from 'shaders/cubes.vert';
import fs from 'shaders/cubes.frag';
import fsSimple from 'shaders/cubesSimple.frag';
import Config from './Config';

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fsSimple);
		// super(vs, fs);
	}


	_init() {
		const cubeSize = .075;
		this.mesh = alfrid.Geom.cube(cubeSize, cubeSize, cubeSize * 5);

		const positions = [];
		const extras = [];
		const num = Config.PLANE_SIZE / cubeSize;
		
		let sx = -Config.PLANE_SIZE/2 + cubeSize * 0.5;
		let sz = -Config.PLANE_SIZE/2 + cubeSize * 0.5;

		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				positions.push([sx + i * cubeSize, 0, sz + j * cubeSize]);
				extras.push([Math.random(), Math.random(), Math.random()]);
			}
		}

		console.log('num instances :', positions.length);

		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(extras, 'aExtra');

		this.roughness = 1;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
	}


	render(textureVel, texture) {
		this.shader.bind();

		this.shader.uniform("uColorMap", "uniform1i", 0);
		this.shader.uniform('uVelMap', 'uniform1i', 1);
		texture.bind(0);
		textureVel.bind(1);

		this.shader.uniform("uPlaneSize", "float", Config.PLANE_SIZE/2);

		GL.draw(this.mesh);
	}


}

export default ViewCubes;
// ViewMountains.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/mountains.vert';
import fs from 'shaders/mountains.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewMountains extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.plane(1, 1, 40, 'xz');

		let i = Config.numMountains;
		const positions = [];
		const extras = [];

		while(i--) {
			let r = Math.sqrt(Math.random()) * Config.floorSize * 0.5;
			let a = Math.random() * Math.PI * 2;


			positions.push([Math.cos(a) * r, Math.random(), Math.sin(a) * r]);
			extras.push([Math.random(), Math.random(), Math.random()]);
		}


		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(extras, 'aExtra');
	}


	render(mLightPos) {
		this.shader.bind();
		this.shader.uniform("uMountainHeight", "float", Config.mountainHeight);
		this.shader.uniform("uMountainScale", "float", Config.mountainScale);
		this.shader.uniform("uLightPos", "vec3", mLightPos);
		GL.draw(this.mesh);
	}


}

export default ViewMountains;
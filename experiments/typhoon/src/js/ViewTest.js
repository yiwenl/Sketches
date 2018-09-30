// ViewTest.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/test.vert';
import fs from 'shaders/test.frag';

import data from './typhoons.json';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewTest extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const posOffset = [];
		const extras = [];
		const dataCopy = data;

		const dataSets = [];
		while(dataCopy.length) {
			const length = Math.min(dataCopy.length, 500);
			const dataSet = dataCopy.splice(0, length);
			dataSets.push(dataSet);
		}

		this.mesh = [];

		dataSets.forEach( dataSet => {
			dataSet.forEach( (typhoon, i) => {
				const pathData = typhoon.data;
				const seed = Math.random();
				const y = random(.05, .2);

				pathData.forEach( (o, j) => {
					const { Latitude, Longitude } = o;
					const lat = parseFloat(Latitude.replace('N', ''));
					const lng = parseFloat(Longitude.replace('W', ''));

					posOffset.push([lat, lng, j/pathData.length + seed])
					extras.push([y, Math.random()]);
				});	
			} )

			const mesh = alfrid.Geom.sphere(0.0005, 12);
			mesh.bufferInstance(posOffset, 'aLatLng');
			mesh.bufferInstance(extras, 'aExtra');

			this.mesh.push(mesh);
		});
		
	}


	render(offset=0) {
		this.shader.bind();
		this.shader.uniform("uSize", "float", Config.size);
		this.shader.uniform("uRadius", "float", Config.radius);
		this.shader.uniform("uOffset", "float", offset);
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime * Config.speed);
		this.shader.uniform("uShift", "float", Config.shift);
		GL.draw(this.mesh);
	}


}

export default ViewTest;
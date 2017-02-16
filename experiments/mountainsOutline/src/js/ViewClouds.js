// ViewClouds.js

import alfrid, { GL } from 'alfrid';
import Params from './Params';
import Assets from './Assets';
// import EventBus from '../../utils/EventBus';

import vs from 'shaders/clouds.vert';
import fs from 'shaders/clouds.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewClouds extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		const size = 20;
		this.mesh = alfrid.Geom.plane(size, size, 1);

		const posOffset = [];
		const extra = [];
		const uvOffset = [];


		for(let i=0; i<Params.numClouds; i++) {
			posOffset.push([Math.PI * Math.random() * 2, random(15, 23), random(25, 27)]);
			extra.push([random(1, 1.5), random(.1, .2)]);
			let u = Math.random() > .5 ? 0.0 : 0.5;
			let v = Math.random() > .5 ? 0.0 : 0.5;
			uvOffset.push([u, v]);
		}


		this.mesh.bufferInstance(posOffset, 'aPosOffset');
		this.mesh.bufferInstance(extra, 'aExtra');
		this.mesh.bufferInstance(uvOffset, 'aUVOffset');

		this._texture = Assets.get('cloudsDay');

		// EventBus.on('onBackgroundStateChange', (e)=> {
		// 	this._onBgChange(e.detail);
		// });
	}


	_onBgChange(o) {

		switch(o.nextState) {
			case 'day':
				this._texture = Assets.get('cloudsDay');
				break;
			case 'night':
				this._texture = Assets.get('cloudsNight');
				break;
			case 'storm':
				this._texture = Assets.get('cloudsStorm');
				break;
		}
	}


	render() {
		this.time += 0.0025;

		this.shader.bind();
		this.shader.uniform("uTime", "float", this.time);

		this.shader.uniform("texture", "uniform1i", 0);
		this._texture.bind(0);

		GL.disable(GL.DEPTH_TEST);
		GL.draw(this.mesh);
		GL.enable(GL.DEPTH_TEST);
	}


}

export default ViewClouds;
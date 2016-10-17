// ViewClouds.js

import alfrid, { GL, Geom } from 'alfrid';
import vs from '../shaders/clouds.vert';
import fs from '../shaders/clouds.frag';
var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewClouds extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.opacity = new alfrid.TweenNumber(1);
		this.time = Math.random();
	}


	_init() {
		const size = 20;
		this.mesh = Geom.plane(size, size, 1);

		this._texture = new alfrid.GLTexture(getAsset('cloud'));
		const numClouds = 6;

		const positions = [];
		const extras = [];
		for( let i=0; i<numClouds; i++) {
			let z = random(30, 40);
			let ry = Math.random() * Math.PI * 2.0;
			let rx = -random(.2, .4);
			let sy = random(1.0, 2.2);
			let sx = sy * (Math.random() > .5 ? 1 : -1);
			let r = random(.5, 1.5);

			positions.push([rx, ry, z]);
			extras.push([sx, sy, r]);
		}

		this.mesh.bufferInstance(positions, 'aPosOffset');
		this.mesh.bufferInstance(extras, 'aExtra');

	}


	render() {
		if(this.opacity.value <= 0.001) return;
		this.time += 0.001;
		GL.disable(GL.DEPTH_TEST);
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uTime", "float", this.time);
		this.shader.uniform("uOpacity", "float", this.opacity.value);
		this._texture.bind(0);
		GL.draw(this.mesh);
		GL.enable(GL.DEPTH_TEST);
	}


}

export default ViewClouds;
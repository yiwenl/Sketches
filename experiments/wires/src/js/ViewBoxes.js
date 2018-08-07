// ViewBoxes.js

import vs from 'shaders/boxes.vert';
import fs from 'shaders/boxes.frag';

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import Assets from './Assets';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewBoxes extends alfrid.View {
	
	constructor(mPoints) {
		super(vs, fs);

		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 0, 0]);
		this.shader.uniform("opacity", "float", 1);

		this._initMesh(mPoints);
	}


	_initMesh(mPoints) {
		let s = 0.05;
		// this.mesh = alfrid.Geom.cube(.15, s, s);
		this.mesh = Assets.get('box');

		const point0 = [];
		const point1 = [];
		const extras = [];
		for(let i=0; i<mPoints.length; i++) {
			point0.push(mPoints[i][0]);
			point1.push(mPoints[i][1]);

			extras.push([random(-5, 5), random(.5, 1), Math.random()]);
		}

		this.mesh.bufferInstance(point0, 'aPoint0');
		this.mesh.bufferInstance(point1, 'aPoint1');
		this.mesh.bufferInstance(extras, 'aExtra');
	}


	render(mCtrl0, mCtrl1) {
		this.shader.bind();
		// this.shader.uniform("uColor", "vec3", [209/255, 219/255, 189/255]);
		this.shader.uniform("uColor", "vec3", [25/255, 52/255, 65/255]);
		this.shader.uniform("uControl0", "vec3", mCtrl0);
		this.shader.uniform("uControl1", "vec3", mCtrl1);
		this.shader.uniform("uTime", "float", alfrid.Scheduler.deltaTime * Config.boxSpeed);
		GL.draw(this.mesh);
	}


}

export default ViewBoxes;
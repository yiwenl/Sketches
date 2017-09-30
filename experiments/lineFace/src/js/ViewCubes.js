// ViewCubes.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/cubes.vert';
import fs from 'shaders/cubes.frag';
import Scheduler from 'scheduling';

var random = function(min, max) { return min + Math.random() * (max - min);	}

const Y_RANGE = 1.5;

class ViewCubes extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = 0.05;
		this.mesh = alfrid.Geom.cube(s, s, s);

		const num = 20000;
		const posOffset = [];
		const extra = [];
		const r = 1.5;
		const ty = 2.2;
		const getPos = () => {
			let x = random(-r, r);
			let z = random(-r, r);
			let y = random(-Y_RANGE, Y_RANGE);

			return [x, y, z];
		}

		for(let i=0; i<num; i++) {
			posOffset.push(getPos());
			extra.push([Math.random() * 2, Math.random(), Math.random()]);
		}

		this.mesh.bufferInstance(posOffset, 'aPosOffset');
		this.mesh.bufferInstance(extra, 'aExtra');
	}


	render(texture0, mShadowMatrix0, texture1, mShadowMatrix1) {
		this.shader.bind();

		this.shader.uniform("texture0", "uniform1i", 0);
		texture0.bind(0);
		this.shader.uniform("texture1", "uniform1i", 1);
		texture1.bind(1);

		this.shader.uniform("uShadowMatrix0", "mat4", mShadowMatrix0);
		this.shader.uniform("uShadowMatrix1", "mat4", mShadowMatrix1);

		this.shader.uniform("uTime", "float", Scheduler.deltaTime * 0.4);
		this.shader.uniform("uRange", "float", Y_RANGE);

		GL.draw(this.mesh);
	}


}

export default ViewCubes;
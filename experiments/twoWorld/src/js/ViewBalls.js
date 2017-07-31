// ViewBalls.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/balls.vert';
import fs from 'shaders/box.frag';
const NUM_BALLS = 200;
const RANGE = 10;
var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewBalls extends alfrid.View {
	
	constructor() {
		// super(vs, alfrid.ShaderLibs.simpleColorFrag);
		super(vs, fs);
		this.shaderColor = new alfrid.GLShader(vs, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(.2, 12);

		const posOffset = [];
		const { PI } = Math;
		let m = mat4.create();
		for(let i=0; i<NUM_BALLS; i++) {
			// let r = Math.random() * RANGE;
			let r = random(2, RANGE);
			let v = vec3.fromValues(0, 0, r);
			mat4.identity(m, m);
			mat4.rotateX(m, m, random(-PI, PI));
			mat4.rotateY(m, m, random(-PI, PI));
			mat4.rotateZ(m, m, random(-PI, PI));
			vec3.transformMat4(v, v, m);

			posOffset.push(v);
		}

		this.mesh.bufferInstance(posOffset, 'aPosOffset');


		this.color = [1, 0, 0];
	}

	renderColor() {
		this.shaderColor.bind();
		this.shaderColor.uniform("color", "vec3", this.color);
		this.shaderColor.uniform("opacity", "float", 1);
		GL.draw(this.mesh);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewBalls;
// ViewBall.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/ball.vert';
import fs from 'shaders/ball.frag';
import fsDepth from 'shaders/depth.frag';

class ViewBall extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.shaderDepth = new alfrid.GLShader(vs, fsDepth);
		this.position = [1, 1, 0]
	}


	_init() {
		let s = .2;
		this.mesh = alfrid.Geom.sphere(s, 24);
	}


	render(mLightPos) {
		this.shader.bind();
		this.shader.uniform("uLightPos", "vec3", mLightPos);
		this.shader.uniform("uPosition", "vec3", this.position);
		GL.draw(this.mesh);
	}


	renderDepth() {
		this.shaderDepth.bind();
		this.shaderDepth.uniform("uPosition", "vec3", this.position);
		GL.draw(this.mesh);
	}


}

export default ViewBall;
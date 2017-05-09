// ViewBall.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/ball.frag';

class ViewBall extends alfrid.View {
	
	constructor() {
		super(null, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(2, 24);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewBall;
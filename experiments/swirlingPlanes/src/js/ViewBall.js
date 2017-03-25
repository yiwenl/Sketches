// ViewBall.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/ball.frag';

class ViewBall extends alfrid.View {
	
	constructor() {
		super(null, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(3, 48);
	}


	render(lightPos) {
		this.shader.bind();
		this.shader.uniform("uLightPos", "vec3", lightPos);
		GL.draw(this.mesh);
	}

}

export default ViewBall;
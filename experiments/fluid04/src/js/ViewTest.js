// ViewTest.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/test.frag';

class ViewTest extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		this.x = Math.random();

		window.addEventListener('mousemove', (e) => {
			// this.x = e.clientX / window.innerWidth;
		});
	}


	render() {
		this.x += 0.01;
		if(this.x > 1) {
			this.x -= 1;
		}
		this.shader.bind();
		this.shader.uniform("uOffset", "float", this.x);
		this.shader.uniform("uRatio", "float", GL.aspectRatio);
		GL.draw(this.mesh);
	}


}

export default ViewTest;
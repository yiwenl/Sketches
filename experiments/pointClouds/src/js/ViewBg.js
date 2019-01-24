// ViewBg.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/bg.frag';

class ViewBg extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uRatio", "float", GL.aspectRatio);
		GL.draw(this.mesh);
	}


}

export default ViewBg;
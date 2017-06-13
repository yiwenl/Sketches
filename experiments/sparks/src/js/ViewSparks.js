// ViewSparks.js

import alfrid, { GL } from 'alfrid';

import fs from 'shaders/sparks.frag';

class ViewSparks extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render() {
		this.time += 0.01;
		this.shader.bind();
		this.shader.uniform("time", "float", this.time);
		GL.draw(this.mesh);
	}


}

export default ViewSparks;
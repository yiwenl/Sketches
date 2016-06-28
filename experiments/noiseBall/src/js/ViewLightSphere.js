// ViewLightSphere.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/basic.vert';
import fs from '../shaders/lightSphere.frag';

class ViewLightSphere extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.time = Math.random() * 0xFF;
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(2, 48);
	}


	render() {
		this.time += 0.01;
		this.shader.bind();
		this.shader.uniform("uTime", "float", this.time);
		GL.draw(this.mesh);
	}


}

export default ViewLightSphere;
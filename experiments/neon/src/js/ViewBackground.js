// ViewBackground.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from '../shaders/bg.vert';
import fs from '../shaders/bg.frag';

class ViewBackground extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.plane(1, 1, 1);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		Assets.get('bg').bind(0);
		this.shader.uniform("uRatio", "float", GL.aspectRatio);
		// this.shader.uniform("color", "vec3", [.8, 0, 0]);
		const br = .85;
		this.shader.uniform("color", "vec3", [br, br, br]);
		GL.draw(this.mesh);
	}


}

export default ViewBackground;
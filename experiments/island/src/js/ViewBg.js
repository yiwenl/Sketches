// ViewBg.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import fs from '../shaders/bg.frag';

class ViewBg extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		this.texture = Assets.get('paper-ball');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("uRatio", "float", GL.aspectRatio);
		GL.draw(this.mesh);
	}


}

export default ViewBg;
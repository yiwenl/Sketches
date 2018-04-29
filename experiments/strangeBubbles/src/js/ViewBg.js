// ViewBg.js


import alfrid, { GL } from 'alfrid';
import fs from 'shaders/bg.frag';
import Assets from './Assets';

class ViewBg extends alfrid.View {
	
	constructor() {
		super(null, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(20, 48, true);
		this.texture = Assets.get('vatican');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewBg;
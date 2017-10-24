// ViewSwirl.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import vs from 'shaders/swirl.vert';
import fs from 'shaders/swirl.frag';
import Scheduler from 'scheduling';

class ViewSwirl extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = Assets.get('swirl');
		this.zScale = 1;

		this.texture = Assets.get('color1');

		gui.add(this, 'zScale', 0, 1);
	}


	render() {
		GL.gl.cullFace(GL.gl.FRONT);
		this.shader.bind();
		this.shader.uniform("zScale", "float", this.zScale);
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("uTime", "float", Scheduler.deltaTime * 0.3);
		GL.draw(this.mesh);

		GL.gl.cullFace(GL.gl.BACK);
	}


	renderMask() {
		GL.draw(this.mesh);
	}


}

export default ViewSwirl;
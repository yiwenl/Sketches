// ViewBox.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';
import fs from 'shaders/box.frag';

class ViewBox extends alfrid.View {
	
	constructor() {
		super(null, fs);
	}


	_init() {
		this.mesh = Assets.get('box');
	}


	render() {
		this.shader.bind();
		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.mesh);
		GL.gl.cullFace(GL.gl.BACK);
	}


}

export default ViewBox;
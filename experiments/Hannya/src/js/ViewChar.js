// ViewChar.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

import vs from '../shaders/char.vert';
import fs from '../shaders/char.frag';

class ViewChar extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.plane(1, 1, 1);
		this.texture = Assets.get('hannya');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		this.shader.uniform("uRatio", "float", GL.aspectRatio);
		GL.draw(this.mesh);
	}


}

export default ViewChar;
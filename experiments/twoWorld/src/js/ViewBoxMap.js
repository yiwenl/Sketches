// ViewBox.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

class ViewBox extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		this.mesh = Assets.get('box');
		this.color = [0, 0, 1];
	}


	render() {
		this.shader.bind();
		this.shader.uniform("color", "vec3", this.color);
		this.shader.uniform("opacity", "float", 1);
		GL.draw(this.mesh);
	}


}

export default ViewBox;
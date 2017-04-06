// ViewBg.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

class ViewBg extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, alfrid.ShaderLibs.copyFrag);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		this.texture = Assets.get('paper');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewBg;
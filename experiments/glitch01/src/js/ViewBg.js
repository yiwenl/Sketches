// ViewBg.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

class ViewBg extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.copyFrag);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(50, 24, true);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		Assets.get('studioReflect').bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewBg;
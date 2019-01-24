// ViewDebugPlane.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';

class ViewDebugPlane extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		let s = Config.floorSize
		this.mesh = alfrid.Geom.plane(s, s, 1, 'xz');

		this.shader.bind();
		let g = 0.2;
		this.shader.uniform("color", "vec3", [g, g, g]);
		this.shader.uniform("opacity", "float", 1);
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewDebugPlane;
// ViewHit.js

import alfrid, { GL } from 'alfrid';

class ViewHit extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(5, 24);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 0, 0]);
		this.shader.uniform("opacity", "float", .5);
		GL.draw(this.mesh);
	}


}

export default ViewHit;
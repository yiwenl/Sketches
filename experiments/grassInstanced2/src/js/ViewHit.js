// ViewHit.js

import alfrid, { GL } from 'alfrid';

class ViewHit extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const size = params.grassRange * 2.0;
		this.mesh = alfrid.Geom.plane(size, size, 1, 'xz');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("color", "vec3", [44/255, 99/255, 0]);
		this.shader.uniform("opacity", "float", 1);
		GL.draw(this.mesh);
	}


}

export default ViewHit;
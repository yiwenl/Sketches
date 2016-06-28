// ViewHitPlane.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/plane.vert';

class ViewHitPlane extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const planeSize = 3;
		this.mesh = alfrid.Geom.plane(planeSize, planeSize, 1);
	}


	render(mRotation, mOffset) {
		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 1, .95]);
		this.shader.uniform("opacity", "float", mOffset * .05);
		this.shader.uniform("uRotation", "vec2", mRotation);
		GL.draw(this.mesh);
	}


}

export default ViewHitPlane;
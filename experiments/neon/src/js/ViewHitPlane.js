// ViewHitPlane.js

import alfrid, { GL } from 'alfrid';

import vs from '../shaders/hit.vert';

class ViewHitPlane extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const planeSize = 3;
		this.mesh = alfrid.Geom.plane(planeSize, planeSize, 1);
		this.opacity = new alfrid.EaseNumber(0);
	}


	render() {
		if(this.opacity.value < 0.001) return;
		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 1, 1]);
		this.shader.uniform("opacity", "float", this.opacity.value);
		this.shader.uniform("uHitPlaneZ", "float", params.hitPlaneZ);
		GL.draw(this.mesh);
	}


}

export default ViewHitPlane;
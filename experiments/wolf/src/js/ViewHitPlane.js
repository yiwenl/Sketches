// ViewHitPlane.js

import alfrid, { GL } from 'alfrid';

class ViewHitPlane extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const size = params.numTiles * params.grassRange * 2.0;
		this.mesh = alfrid.Geom.plane(size, size, 1, 'xz');
	}


	render() {
		this.shader.bind();
		const grey = 0.9;
		// this.shader.uniform("color", "vec3", [grey, grey, grey]);
		this.shader.uniform("color", "vec3", [126/255, 155/255, 68/255]);
		this.shader.uniform("opacity", "float", 1);
		GL.draw(this.mesh);
	}


}

export default ViewHitPlane;
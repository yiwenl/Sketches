// ViewPlane.js

import alfrid, { GL } from 'alfrid';

import vs from '../shaders/floor.vert';
import fs from '../shaders/floor.frag';

class ViewPlane extends alfrid.View {
	
	constructor() {
		// super(alfrid.ShaderLibs.generalVert, alfrid.ShaderLibs.simpleColorFrag);
		super(vs, fs);
	}


	_init() {
		const size = 25;
		this.mesh = alfrid.Geom.plane(size, size, 1, 'xz');
	}


	render(shadowMatrix, textureDepth) {
		this.shader.bind();
		this.shader.uniform("position", "vec3", [0, -10, 0]);

		this.shader.uniform("uShadowMatrix", "uniformMatrix4fv", shadowMatrix);
		this.shader.uniform("textureDepth", "uniform1i", 0);
		textureDepth.bind(0);	

		GL.draw(this.mesh);
	}


}

export default ViewPlane;
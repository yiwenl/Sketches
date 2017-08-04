// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import vs from 'shaders/floor.vert';
import fs from 'shaders/floor.frag';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const s = 40;
		this.mesh = alfrid.Geom.plane(s, s, 1, 'xz');
		this.position = [0, -15, 0];
	}


	render(shadowMatrix, textureDepth) {
		this.shader.bind();
		this.shader.uniform("uPosition", "vec3", this.position);
		this.shader.uniform("textureDepth", "uniform1i", 0);
		textureDepth.bind(0);
		this.shader.uniform("uShadowMatrix", "mat4", shadowMatrix);
		this.shader.uniform("bias", "float", params.bias);
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
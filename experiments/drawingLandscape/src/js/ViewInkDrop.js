// ViewInkDrop.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/basic.vert';

class ViewInkDrop extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(1, 12);
	}


	render(mPosition, mScale) {
		this.shader.bind();
		this.shader.uniform('uPosition', 'vec3', mPosition);
		this.shader.uniform('uScale', 'vec3', [mScale, mScale, mScale]);
		this.shader.uniform('color', 'vec3', [0, 0, 0]);
		this.shader.uniform('opacity', 'float', 1);
		GL.draw(this.mesh);
	}

}

export default ViewInkDrop;
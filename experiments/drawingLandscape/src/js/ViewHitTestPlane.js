// ViewHitTestPlane.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/basic.vert';

class ViewHitTestPlane extends alfrid.View {
	
	constructor() {
		super(vs, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const size = params.terrainSize;
		this.mesh = alfrid.Geom.plane(size, size, 1, 'xz');
	}


	render() {
		this.shader.bind();
		this.shader.uniform('uScale', 'vec3', [1, 1, 1]);
		this.shader.uniform('uPosition', 'vec3', [0, 1, 0]);
		this.shader.uniform('color', 'vec3', [1, 1, 1]);
		this.shader.uniform('opacity', 'float', .5);
		GL.draw(this.mesh);
	}

}

export default ViewHitTestPlane;
// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import Params from './Params';

class ViewFloor extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.generalVert, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		const size = 100;
		this.mesh = alfrid.Geom.plane(size, size, 1, 'xz');

		this.shader.bind();
		this.shader.uniform("position", "vec3", [0, 0, 0]);
		this.shader.uniform("scale", "vec3", [1, 1, 1]);
		this.shader.uniform("opacity", "float", 1);
	}


	render() {
		this.shader.bind();
		this.shader.uniform("color", "vec3", Params.shaderFogColor);
		
		GL.draw(this.mesh);
	}


}

export default ViewFloor;
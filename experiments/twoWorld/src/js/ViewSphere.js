// ViewSphere.js

import alfrid, { GL } from 'alfrid';

class ViewSphere extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.skyboxVert, alfrid.ShaderLibs.simpleColorFrag);

		console.log(alfrid.ShaderLibs);
	}


	_init() {
		this.mesh = alfrid.Geom.sphere(50, 12, true);
		this.color = [1, 0, 0];
	}


	render() {
		this.shader.bind();
		this.shader.uniform("color", "vec3", this.color);
		this.shader.uniform("opacity", "float", 1);
		GL.draw(this.mesh);
	}


}

export default ViewSphere;
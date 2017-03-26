// ViewNormal.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/normal.frag';

class ViewNormal extends alfrid.View {
	
	constructor(mesh) {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);

		this.mesh = mesh;
	}

	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewNormal;
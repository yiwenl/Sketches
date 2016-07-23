// ViewPost.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/post.frag';

class ViewPost extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		this.shader.uniform("texture", "uniform1i", 0);
	}


	render(texture) {
		this.shader.bind();
		texture.bind(0);
		this.shader.uniform("invert", "uniform1f", params.isInvert);
		GL.draw(this.mesh);
	}


}

export default ViewPost;
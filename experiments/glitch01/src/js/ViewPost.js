// ViewPost.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/post.frag';

class ViewPost extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, textureBloom) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureBloom", "uniform1i", 1);
		textureBloom.bind(1);
		GL.draw(this.mesh);
	}


}

export default ViewPost;
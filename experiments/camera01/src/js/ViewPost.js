// ViewPost.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/post.frag';

class ViewPost extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		this.shader.bind();
		this.shader.uniform('texture', 'uniform1i', 0);
		this.shader.uniform('textureAO', 'uniform1i', 1);
	}


	render(texture, textureAO) {
		this.shader.bind();
		texture.bind(0);
		textureAO.bind(1);
		GL.draw(this.mesh);
	}


}

export default ViewPost;
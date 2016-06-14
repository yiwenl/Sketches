// ViewPost.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/post.frag';

class ViewPost extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = 0;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, textureAO) {
		this.time += 0.01;
		this.shader.bind();
		this.shader.uniform('resolution', 'vec2', [GL.width, GL.height]);
		this.shader.uniform("time", "float", this.time);
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("textureSSAO", "uniform1i", 1);
		textureAO.bind(1);
		GL.draw(this.mesh);
	}


}

export default ViewPost;
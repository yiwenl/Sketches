// ViewPost.js

import alfrid, { GL } from 'alfrid';
import fs from '../shaders/post.frag';

class ViewPost extends alfrid.View {
	
	constructor(mesh) {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);

		this.invert = new alfrid.TweenNumber(0, 'expInOut', 0.04);
		this.mesh = mesh;

		this.offset = 0;
		gui.add(this, 'offset', 0, 1);
	}


	_init() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("textureAO", "uniform1i", 1);
	}


	render(texture, textureAO) {
		this.shader.bind();
		texture.bind(0);
		textureAO.bind(1);

		// this.shader.uniform("uInvert", "float", this.invert.value);
		// this.shader.uniform("uOffset", "float", this.offset);
		GL.draw(this.mesh);
	}


}

export default ViewPost;
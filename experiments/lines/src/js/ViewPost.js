// ViewPost.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewPost extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, glslify('../shaders/post.frag'));
		this.count = Math.random();
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, textureNormal, textureLight) {
		this.count += .01;
		this.shader.bind();

		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureNormal", "uniform1i", 1);
		textureNormal.bind(1);

		this.shader.uniform("textureLight", "uniform1i", 2);
		textureLight.bind(2);

		this.shader.uniform("time", "uniform1f", this.count);

		GL.draw(this.mesh);
	}


}

export default ViewPost;
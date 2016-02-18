// ViewPost.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewPost extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, glslify('../shaders/post.frag'));
		this.time = Math.random() * 1000;
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render(texture, textureSSAO) {

		this.shader.bind();
		this.shader.uniform("time", "uniform1f", this.time);
		this.shader.uniform("resolution", "uniform2fv", [GL.width, GL.height]);
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);

		this.shader.uniform("textureSSAO", "uniform1i", 1);
		textureSSAO.bind(1);
		
		GL.draw(this.mesh);
	}


}

export default ViewPost;
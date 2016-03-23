// ViewPost.js


import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewPost extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, glslify('../shaders/post.frag'));
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
// ViewMask.js

import alfrid, { GL } from 'alfrid';
import fs from 'shaders/mask.frag';

class ViewMask extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
		this.seed = Math.random() * 0xFF;
	}


	render() {
		this.shader.bind();
		this.shader.uniform("seed", "float", this.seed);
		this.shader.uniform("color", "vec3", [231/255, 227/255, 226/255]);
		this.shader.uniform("ratio", "float", GL.aspectRatio);
		GL.draw(this.mesh);
	}


}

export default ViewMask;